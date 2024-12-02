package com.example.currencyconverter;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

@Service
public class CurrencyService {

    private static final String HISTORICAL_API_URL = "https://api.exchangerate.host/timeframe";
    private static final String EXCHANGE_API_URL = "https://v6.exchangerate-api.com/v6/";
    private static final String EXCHANGE_API_KEY = "95f4ea8c5ce67fa306a93b73";
    private static final String HISTORICAL_API_KEY = "c4329b12ff462fbb007061b33c4a9acf";

    // Fetch the latest exchange rate
    public double fetchExchangeRate(String baseCurrency, String targetCurrency) throws Exception {
        System.out.println("Fetching exchange rate from API...");
        String urlString = EXCHANGE_API_URL + EXCHANGE_API_KEY + "/latest/" + baseCurrency + "?symbols=" + targetCurrency;
        String jsonResponse = fetchApiResponse(urlString);

        JsonObject jsonObject = JsonParser.parseString(jsonResponse).getAsJsonObject();
        if (jsonObject.has("conversion_rates") && jsonObject.getAsJsonObject("conversion_rates").has(targetCurrency)) {
            return jsonObject.getAsJsonObject("conversion_rates").get(targetCurrency).getAsDouble();
        } else {
            throw new RuntimeException("Target currency not found or invalid base currency.");
        }
    }

    // Fetch historical rates for a given date range
    public List<Double> fetchHistoricalRates(String baseCurrency, String targetCurrency, String startDate, String endDate) throws Exception {
        System.out.println("Fetching historical rates...");
        String urlString = HISTORICAL_API_URL + "?access_key=" + HISTORICAL_API_KEY 
                + "&currencies=" + baseCurrency +","+targetCurrency+"&start_date=" + startDate + "&end_date=" + endDate;
        String jsonResponse = fetchApiResponse(urlString);

        JsonObject jsonObject = JsonParser.parseString(jsonResponse).getAsJsonObject();
        List<Double> historicalRates = new ArrayList<>();

        if (jsonObject.has("quotes")) {
            JsonObject quotes = jsonObject.getAsJsonObject("quotes");

            for (String date : quotes.keySet()) {
                JsonObject rateData = quotes.getAsJsonObject(date);
                String fullKey = "USD" + targetCurrency; // Matches the format of response keys like USDINR
                if (rateData.has(fullKey)) {
                    historicalRates.add(rateData.get(fullKey).getAsDouble());
                }
            }
        } else {
            throw new RuntimeException("Error fetching historical data or invalid response.");
        }
        return historicalRates;
    }

    // Helper function to fetch API response
    private String fetchApiResponse(String urlString) throws Exception {
        URI uri = new URI(urlString);
        URL url = uri.toURL();
        HttpURLConnection request = (HttpURLConnection) url.openConnection();
        request.setRequestMethod("GET");
        request.connect();

        int responseCode = request.getResponseCode();
        if (responseCode != 200) {
            throw new RuntimeException("HTTP GET Request Failed with Error code : " + responseCode);
        }

        BufferedReader in = new BufferedReader(new InputStreamReader(request.getInputStream()));
        StringBuilder response = new StringBuilder();
        String inputLine;
        while ((inputLine = in.readLine()) != null) {
            response.append(inputLine);
        }
        in.close();
        return response.toString();
    }
}