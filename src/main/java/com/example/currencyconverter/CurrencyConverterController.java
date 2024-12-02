package com.example.currencyconverter;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CurrencyConverterController {

    @Autowired
    private CurrencyService currencyService;

    // Endpoint for conversion and prediction
    @GetMapping("/convert")
    public ResponseEntity<Map<String, Object>> convert(
            @RequestParam("baseCurrency") String baseCurrency,
            @RequestParam("targetCurrency") String targetCurrency,
            @RequestParam(value = "targetRate", required = false) Double targetRate,
            @RequestParam(value = "historyDays", defaultValue = "180") int historyDays) {

        try {
            // Fetch the exchange rate
            double currentRate = currencyService.fetchExchangeRate(baseCurrency, targetCurrency);

            Map<String, Object> response = new HashMap<>();
            response.put("currentRate", currentRate);
            response.put("baseCurrency", baseCurrency);
            response.put("targetCurrency", targetCurrency);

            // Handle prediction logic if targetRate is provided
            if (targetRate != null) {
                String endDate = getFormattedDate(0); // Today
                String startDate = getFormattedDate(historyDays); // historyDays ago

                List<Double> historicalRates = currencyService.fetchHistoricalRates(baseCurrency, targetCurrency, startDate, endDate);
                String predictionDate = predictExchangeRate(currentRate, targetRate, historicalRates);
                response.put("predictionDate", predictionDate);
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error fetching exchange rate: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // Predict when the target exchange rate will be reached
    public String predictExchangeRate(double currentRate, double targetRate, List<Double> historicalRates) {
        if (historicalRates.size() < 2) {
            return "Not enough data to predict.";
        }

        // Check for an unrealistic target rate based on the current exchange rate (e.g., more than 10x current rate)
        if (targetRate > currentRate * 10) {
            return "Warning: Target rate is unreasonably high compared to current rate. Prediction not possible.";
        }

        // Check for negative or zero target rates
        if (targetRate <= 0) {
            return "Warning: Target rate cannot be zero or negative.";
        }

        // Calculate the rate change over the historical data
        List<Double> rateChanges = new ArrayList<>();
        double totalRateChange = 0;
        for (int i = 1; i < historicalRates.size(); i++) {
            double change = historicalRates.get(i) - historicalRates.get(i - 1);
            rateChanges.add(change);
            totalRateChange += change;
        }

        // Calculate the average daily rate change
        double avgRateChangePerDay = totalRateChange / (historicalRates.size() - 1);

        // If the average rate change is zero, prediction is not possible
        if (avgRateChangePerDay == 0) {
            return "Prediction not possible: no significant rate changes detected.";
        }

        // Calculate the rate difference between current rate and target rate
        double rateDifference = Math.abs(targetRate - currentRate);
        
        // Calculate the time (in days) to reach the target rate based on average daily change
        int daysToReachTarget = (int) Math.ceil(rateDifference / Math.abs(avgRateChangePerDay));
        
        // Handle edge cases: Ensure a minimum of 1 day for predictions
        if (daysToReachTarget < 1) {
            daysToReachTarget = 1;
        }

        // Maximum prediction time (e.g., 5 years)
        if (daysToReachTarget > 1800) {
            return "Warning: Target is too far in the future. Prediction limited to 5 years.";
        }

        // Calculate the predicted target time
        long targetTime = System.currentTimeMillis() + (daysToReachTarget * 24 * 60 * 60 * 1000L);
        return new SimpleDateFormat("dd-MM-yyyy").format(new Date(targetTime));
    }

    // Helper to format dates
    private String getFormattedDate(int daysAgo) {
        long time = System.currentTimeMillis() - (daysAgo * 24 * 60 * 60 * 1000L);
        return new SimpleDateFormat("yyyy-MM-dd").format(new Date(time));
    }
}   