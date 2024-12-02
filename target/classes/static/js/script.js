document.addEventListener("DOMContentLoaded", function () {
    // Initialize form and modal
    const currencyForm = document.getElementById("currencyForm");
    const resultModal = document.getElementById("resultModal");
    const closeModalBtn = document.getElementById("closeModal");

    const modalBaseCurrency = document.getElementById("modalBaseCurrency");
    const modalTargetCurrency = document.getElementById("modalTargetCurrency");
    const modalExchangeRate = document.getElementById("modalExchangeRate");
    const modalPredictionDate = document.getElementById("modalPredictionDate");
    const modalPredictionDateText = document.getElementById("modalPredictionDateText");
    const modalTargetedExchangeRate = document.getElementById("modalTargetedExchangeRate");
    const modalDateTime = document.getElementById("modalDateTime");
    const warningMessage = document.getElementById("warningMessage"); // Make sure warningMessage exists in your HTML

    // Function to get the current date and time
    function getCurrentDateTime() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit', 
            hour12: true 
        };
        return now.toLocaleString('en-US', options);
    }

    // Set the current date and time in the modal
    modalDateTime.textContent = getCurrentDateTime();

    // Load stored values if any
    if (localStorage.getItem("baseCurrency")) {
        document.getElementById("baseCurrency").value = localStorage.getItem("baseCurrency");
    }

    if (localStorage.getItem("baseCurrencyvalue")) {
        document.getElementById("baseCurrencyvalue").value = localStorage.getItem("baseCurrencyvalue");
    }

    if (localStorage.getItem("targetCurrency")) {
        document.getElementById("targetCurrency").value = localStorage.getItem("targetCurrency");
    }
    if (localStorage.getItem("targetRate")) {
        document.getElementById("targetRate").value = localStorage.getItem("targetRate");
    }

    // Reset modal content function
    function resetModal() {
        modalBaseCurrency.textContent = '';
        modalTargetCurrency.textContent = '';
        modalExchangeRate.textContent = '';
        modalTargetedExchangeRate.textContent = '';
        modalPredictionDateText.textContent = '';
        modalPredictionDate.style.display = 'none';
    }

    // Form submission handler for Currency Converter
    currencyForm.addEventListener("submit", function (e) {
        e.preventDefault(); // Prevent form from submitting and refreshing the page

        // Reset warning message and modal content before processing
        warningMessage.style.display = "none";  // Hide the warning message
        modalPredictionDate.style.display = "none";
        warningMessage.textContent = "";

        resetModal(); // Reset modal content

        let baseCurrency = document.getElementById("baseCurrency").value.trim().toUpperCase();  // Convert to uppercase
        const baseCurrencyvalue = document.getElementById("baseCurrencyvalue").value;
        let targetCurrency = document.getElementById("targetCurrency").value.trim().toUpperCase();  // Convert to uppercase
        const targetRate = document.getElementById("targetRate").value;

        // Store form values in localStorage (only if valid)
        localStorage.setItem("baseCurrency", baseCurrency);
        localStorage.setItem("baseCurrencyvalue", baseCurrencyvalue);
        localStorage.setItem("targetCurrency", targetCurrency);
        localStorage.setItem("targetRate", targetRate);

        // Check if the entered currency codes are valid by making an API call
        fetch(`/convert?baseCurrency=${baseCurrency}&targetCurrency=${targetCurrency}`)
            .then(response => response.json())
            .then(data => {
                // If the API returns an error (invalid currency codes), show an error message in warningMessage
                if (data.error) {
                    warningMessage.style.display = "block";
                    warningMessage.textContent = `Invalid currency code(s) entered: ${baseCurrency} or ${targetCurrency}. Please try again with valid codes.`;
                    resultModal.style.display = "none"; // Don't open the modal
                    return; // Stop further execution if currencies are invalid
                }

                // If the API response is valid, proceed with the exchange rate calculation
                fetch(`/convert?baseCurrency=${baseCurrency}&targetCurrency=${targetCurrency}&targetRate=${targetRate}`)
                    .then(response => response.json())
                    .then(data => {
                        // If the API returns an error, show an error message in warningMessage
                        if (!baseCurrency || !targetCurrency || isNaN(baseCurrencyvalue) || isNaN(targetRate) || !data.currentRate || data.error) {
                            warningMessage.style.display = "block";
                            warningMessage.textContent = `Invalid currency code(s) entered: ${baseCurrency} or ${targetCurrency}. Please try again with valid codes.`;
                            modalPredictionDate.style.display = "none";
                            resultModal.style.display = "none"; // Don't open the modal
                        } 
                        else {
                            // If no error, display the exchange rate and prediction
                            modalBaseCurrency.textContent = `${baseCurrencyvalue} ${baseCurrency}`;
                            let targetCurrencyvalue = baseCurrencyvalue * data.currentRate;

                            modalTargetCurrency.textContent = `${targetCurrencyvalue.toFixed(2)} ${targetCurrency}`;
                            modalTargetedExchangeRate.textContent = `${targetRate} ${targetCurrency}`;

                            // Updated exchange rate message and predicted date formatting
                            modalExchangeRate.textContent = `Today's Exchange Rate: ${data.currentRate} ${targetCurrency}`;

                            if (data.predictionDate) {
                                modalPredictionDate.style.display = "block";
                                modalPredictionDateText.textContent = `Target can be achieved by: ${data.predictionDate}`;
                            } else {
                                modalPredictionDate.style.display = "none";
                            }

                            warningMessage.style.display = "none";  // Hide the warning message if the request is successful
                            resultModal.style.display = "flex"; // Show the modal only if no error
                        }
                    })
                    .catch(error => {
                        // In case of a network or unexpected error, show it in the warningMessage
                        warningMessage.style.display = "block";
                        warningMessage.textContent = `An error occurred while fetching data: ${error.message}`;
                        modalPredictionDate.style.display = "none";
                        resultModal.style.display = "none"; // Don't open the modal
                    });
            })
            .catch(error => {
                // If there's an issue making the request to check for valid currencies, show it in the warningMessage
                warningMessage.style.display = "block";
                warningMessage.textContent = `An error occurred while validating currencies: ${error.message}`;
                modalPredictionDate.style.display = "none";
                resultModal.style.display = "none"; // Don't open the modal
            });
    });

    // Close modal handler for Currency Converter   
    closeModalBtn.addEventListener("click", function () {
        resultModal.style.display = "none"; // Hide modal
        currencyForm.reset(); // Reset the form
        localStorage.clear(); // Clear local storage
    });




// Initialize stock form and card elements
const stockForm = document.getElementById("stock-form");
const stockSymbolInput = document.getElementById("stock-symbol");
const stockCardsContainer = document.querySelector(".tab-content");

// Default stocks to display on page load if no session data exists
const defaultStocks = ["AAPL", "GOOGL", "AMZN", "TSLA"];

// Function to create a stock card with company logo and data
function createStockCard(stockSymbol, stockData) {
    const latestPrice = stockData.c;
    const priceChange = stockData.d;
    const priceChangePercentage = stockData.dp;

    const newStockCard = document.createElement('li');
    newStockCard.classList.add('trend-card');
    newStockCard.innerHTML = `
        <div class="card-title-wrapper">
            <img src="/images/coin-1.svg" width="24" height="24" alt="${stockSymbol} logo">
            <a href="#" class="card-title">${stockSymbol}</a>
        </div>
        <data class="card-value" value="${latestPrice}">USD ${latestPrice}</data>
        <div class="card-analytics">
            <data class="current-price" value="${latestPrice}">${latestPrice}</data>
            <div class="badge">${priceChangePercentage.toFixed(2)}%</div>
        </div>`;
    return newStockCard;
}

// Function to update the session storage with current stock symbols
function updateSessionStorage() {
    const currentStocks = Array.from(stockCardsContainer.querySelectorAll('.card-title'))
        .map(card => card.textContent.trim().toUpperCase());
    sessionStorage.setItem('stocks', JSON.stringify(currentStocks));
}

// Function to fetch stock data and update the DOM
function fetchStockData(stockSymbol, callback) {
    fetch(`/api/stock?symbol=${stockSymbol}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.c !== undefined) {
                callback(stockSymbol, data);
            } else {
                alert(`No data found for the stock symbol: ${stockSymbol}`);
            }
        })
        .catch(error => {
            console.error("Error fetching stock data:", error);
            alert("Failed to fetch stock data!");
        });
}

// Function to replace the leftmost stock and shift others
function replaceLeftmostStock(stockSymbol, stockData) {
    const newStockCard = createStockCard(stockSymbol, stockData);

    // Add the new stock card to the leftmost position
    stockCardsContainer.insertBefore(newStockCard, stockCardsContainer.firstChild);

    // Remove the rightmost card if more than 4 stocks are displayed
    if (stockCardsContainer.children.length > 4) {
        stockCardsContainer.removeChild(stockCardsContainer.lastChild);
    }

    // Update session storage
    updateSessionStorage();

    // Highlight the new card temporarily
    newStockCard.style.backgroundColor = '#4CAF50'; // Green highlight
    setTimeout(() => {
        newStockCard.style.backgroundColor = ''; // Reset background color
    }, 1000);
}

// Function to handle adding a new stock
function addStockCard(stockSymbol) {
    const existingStockCards = Array.from(document.querySelectorAll('.trend-card .card-title'));
    const existingSymbolsInDOM = existingStockCards.map(card => card.textContent.trim().toUpperCase());

    if (existingSymbolsInDOM.includes(stockSymbol.toUpperCase())) {
        alert("This stock is already added.");
        return;
    }

    fetchStockData(stockSymbol, replaceLeftmostStock);
}

// On page load, fetch and display stocks from session storage or default stocks
window.onload = () => {
    const storedStocks = JSON.parse(sessionStorage.getItem('stocks')) || defaultStocks;

    stockCardsContainer.innerHTML = ''; // Clear existing cards
    storedStocks.forEach(stockSymbol => {
        fetchStockData(stockSymbol, (symbol, data) => {
            const stockCard = createStockCard(symbol, data);
            stockCardsContainer.appendChild(stockCard);

            // Ensure the stock cards are only 4 (trim extra if session data had more)
            if (stockCardsContainer.children.length > 4) {
                stockCardsContainer.removeChild(stockCardsContainer.lastChild);
            }

            updateSessionStorage();
        });
    });
};

// Handle stock form submission
stockForm.addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent form from submitting
    const stockSymbol = stockSymbolInput.value.trim().toUpperCase();
    addStockCard(stockSymbol);
});



// Update stock cards every 10 seconds
setInterval(() => {
    // Get all stock symbols in the cards
    const stockSymbolsInDOM = Array.from(document.querySelectorAll('.trend-card .card-title'))
        .map(card => card.textContent.trim().toUpperCase());

    // Fetch and update stock data for each visible stock symbol
    stockSymbolsInDOM.forEach(stockSymbol => {
        fetch(`/api/stock?symbol=${stockSymbol}`)
            .then(response => response.json())
            .then(data => {
                if (data && data.c !== undefined) {
                    // Find the stock card and update its content
                    const card = Array.from(stockCardsContainer.children)
                        .find(child => child.querySelector('.card-title').textContent.trim().toUpperCase() === stockSymbol);

                    // Update the stock card with new data
                    const latestPrice = data.c;
                    const priceChangePercentage = data.dp;

                    card.querySelector('.current-price').textContent = latestPrice;
                    card.querySelector('.badge').textContent = `${priceChangePercentage.toFixed(2)}%`;

                    // Optionally highlight the updated card
                    card.style.backgroundColor = '#FFC107';  // Yellow highlight color
                    setTimeout(() => {
                        card.style.backgroundColor = '';  // Reset background color after a short time
                    }, 1000);
                }
            })
            .catch(error => console.error(`Error updating stock data for ${stockSymbol}:`, error));
    });
}, 10000);  // Update every 10 seconds


});
