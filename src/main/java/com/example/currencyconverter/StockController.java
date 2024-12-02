package com.example.currencyconverter;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class StockController {

    private final StockService stockService;

    // Constructor-based dependency injection for StockService
    public StockController(StockService stockService) {
        this.stockService = stockService;
    }

    // Mapping for the stock data endpoint
    @GetMapping("/api/stock")
    public String getStockData(@RequestParam String symbol) {
        // Call the StockService to get the stock data
        return stockService.getStockData(symbol);
    }
}
