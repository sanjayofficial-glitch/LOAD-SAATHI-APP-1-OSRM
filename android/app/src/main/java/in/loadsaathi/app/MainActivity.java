package in.loadsaathi.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.webkit.CookieManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "LoadSaathi";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Enable cookies for Clerk auth
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        cookieManager.setAcceptThirdPartyCookies(getBridge().getWebView(), true);

        // Handle deep link intent on cold start
        handleOAuthRedirect(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        // Handle deep link intent when app is already running
        handleOAuthRedirect(intent);
    }

    private void handleOAuthRedirect(Intent intent) {
        Uri data = intent.getData();
        if (data == null) return;

        String url = data.toString();
        Log.d(TAG, "OAuth redirect received: " + url);

        // If the redirect contains a Clerk handshake parameter, load it in the WebView
        if (url.contains("__clerk_handshake") || url.contains("/auth-sync")) {
            Log.d(TAG, "Loading Clerk OAuth callback in WebView: " + url);
            // The Capacitor bridge will route this URL to the WebView
            Intent loadIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            loadIntent.putExtras(intent.getExtras());
            // Don't start a new activity - let the bridge handle it
        }
    }
}
