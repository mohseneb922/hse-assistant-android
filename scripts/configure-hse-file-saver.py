#!/usr/bin/env python3
"""Inject the app-local Android Storage Access Framework file saver plugin."""
from pathlib import Path
import re

java_root = Path("android/app/src/main/java")
activities = list(java_root.rglob("MainActivity.java"))
if len(activities) != 1:
    raise SystemExit(f"Expected exactly one MainActivity.java, found {len(activities)}")

activity = activities[0]
source = activity.read_text(encoding="utf-8")
package_match = re.search(r"^package\s+([\w.]+)\s*;", source, re.M)
if not package_match:
    raise SystemExit("Could not determine MainActivity Java package")
package_name = package_match.group(1)

plugin = r"""package __PACKAGE__;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.util.Base64;

import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.OutputStream;

@CapacitorPlugin(name = "HSEFileSaver")
public class HSEFileSaverPlugin extends Plugin {
    @PluginMethod
    public void saveFile(PluginCall call) {
        String fileName = call.getString("fileName");
        String mimeType = call.getString("mimeType", "application/octet-stream");
        String data = call.getString("data");

        if (fileName == null || fileName.trim().isEmpty() || data == null) {
            call.reject("File name and file data are required");
            return;
        }

        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType(mimeType);
        intent.putExtra(Intent.EXTRA_TITLE, fileName);

        try {
            startActivityForResult(call, intent, "saveFileResult");
        } catch (Exception error) {
            call.reject("Could not open Android file picker", error);
        }
    }

    @ActivityCallback
    private void saveFileResult(PluginCall call, ActivityResult result) {
        if (call == null) return;

        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null) {
            JSObject cancelled = new JSObject();
            cancelled.put("cancelled", true);
            call.resolve(cancelled);
            return;
        }

        Uri uri = result.getData().getData();
        if (uri == null) {
            call.reject("No destination was selected");
            return;
        }

        String encoded = call.getString("data");
        if (encoded == null) {
            call.reject("File data is missing");
            return;
        }

        try {
            byte[] bytes = Base64.decode(encoded, Base64.DEFAULT);
            try (OutputStream output = getContext().getContentResolver().openOutputStream(uri, "wt")) {
                if (output == null) throw new IllegalStateException("Could not open selected file");
                output.write(bytes);
                output.flush();
            }

            JSObject saved = new JSObject();
            saved.put("success", true);
            saved.put("uri", uri.toString());
            call.resolve(saved);
        } catch (Exception error) {
            call.reject("Could not write the backup file", error);
        }
    }
}
""".replace("__PACKAGE__", package_name)

plugin_path = activity.parent / "HSEFileSaverPlugin.java"
plugin_path.write_text(plugin, encoding="utf-8")

if "registerPlugin(HSEFileSaverPlugin.class);" not in source:
    if "import android.os.Bundle;" not in source:
        source = source.replace("package " + package_name + ";", "package " + package_name + ";\n\nimport android.os.Bundle;")
    if "public class MainActivity" not in source:
        raise SystemExit("MainActivity class declaration not found")
    source = re.sub(
        r"public class MainActivity extends BridgeActivity\s*\{\s*\}",
        """public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(HSEFileSaverPlugin.class);
        super.onCreate(savedInstanceState);
    }
}""",
        source,
        count=1
    )
    if "registerPlugin(HSEFileSaverPlugin.class);" not in source:
        raise SystemExit("Could not safely register HSEFileSaverPlugin in MainActivity")
    activity.write_text(source, encoding="utf-8")

print(f"Installed HSEFileSaverPlugin in {plugin_path}")
print(f"Registered plugin in {activity}")
