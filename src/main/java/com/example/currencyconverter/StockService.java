package com.example.currencyconverter;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class StockService {

    private final RestTemplate restTemplate;

    // Finnhub API Key (replace with your actual key)
    private final String API_KEY = "csvkj9pr01qo7odcsvk0csvkj9pr01qo7odcsvkg";  // Use your Finnhub API key here
    private final String BASE_URL = "https://finnhub.io/api/v1/quote?symbol=%s&token=%s";

    public StockService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // Method to get stock data
    public String getStockData(String symbol) {
        // Construct the URL for the Finnhub API
        String url = String.format(BASE_URL, symbol, API_KEY);

        // Send request to the API and get the response
        String response = restTemplate.getForObject(url, String.class);
        System.out.println("API Response: " + response);  // Log the raw response
        return response;
    }
}
