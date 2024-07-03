import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;

public class HealthCheck {
    public static void main(String[] args) {
        try {
            int responseCode = getResponseCode(args[0]);
            System.exit(responseCode == HttpURLConnection.HTTP_OK ? 0 : 1);
        } catch (IOException e) {
            System.exit(1);
        }
    }

    private static int getResponseCode(String url) throws IOException {
        HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
        return connection.getResponseCode();
    }
}
