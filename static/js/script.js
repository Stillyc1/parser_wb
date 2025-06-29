// Функция для получения данных из таблицы
function getProducts() {
    return Array.from(document.querySelectorAll('#productTable tbody tr')).map(row => {
        return {
            name: row.children[0].innerText,
            price: parseInt(row.children[1].innerText),
            price_discount: parseInt(row.children[2].innerText),
            rating: parseFloat(row.children[3].innerText),
            feedbacks: parseInt(row.children[4].innerText),
        };
    });
}

// Функция отображения продуктов на странице
function displayProducts(filteredProducts) {
    const tableBody = document.getElementById("productTable").getElementsByTagName('tbody')[0];
    tableBody.innerHTML = ''; // Очистка таблицы
    filteredProducts.forEach(product => {
        const row = tableBody.insertRow();
        row.insertCell(0).innerText = product.name;
        row.insertCell(1).innerText = product.price;
        row.insertCell(2).innerText = product.price_discount;
        row.insertCell(3).innerText = product.rating;
        row.insertCell(4).innerText = product.feedbacks;
    });
}

// Функция фильтрации продуктов
function applyFilters(products) {
    const priceRange = document.getElementById("priceRange").value;
    const minRating = parseFloat(document.getElementById("minRating").value);
    const minReviews = parseInt(document.getElementById("minReviews").value, 10);

    const filteredProducts = products.filter(product =>
        product.price <= priceRange &&
        product.rating >= minRating &&
        product.feedbacks >= minReviews
    );

    return filteredProducts;
}

// Функция для сортировки продуктов
function sortProducts(products, sortBy) {
    switch (sortBy) {
        case "nameAsc":
            return products.sort((a, b) => a.name.localeCompare(b.name));
        case "nameDesc":
            return products.sort((a, b) => b.name.localeCompare(a.name));
        case "priceAsc":
            return products.sort((a, b) => a.price - b.price);
        case "priceDesc":
            return products.sort((a, b) => b.price - a.price);
        case "ratingAsc":
            return products.sort((a, b) => a.rating - b.rating);
        case "ratingDesc":
            return products.sort((a, b) => b.rating - a.rating);
        case "reviewsAsc":
            return products.sort((a, b) => a.feedbacks - b.feedbacks);
        case "reviewsDesc":
            return products.sort((a, b) => b.feedbacks - a.feedbacks);
        default:
            return products;
    }
}

// Обработчик события для фильтров
document.getElementById("filterBtn").addEventListener("click", () => {
    const products = getProducts();
    const filteredProducts = applyFilters(products);
    displayProducts(filteredProducts);
});

// Обработчик события для сортировки
document.getElementById("sortBtn").addEventListener("click", () => {
    const products = getProducts();
    const sortBy = document.getElementById("sortOptions").value;
    const sortedProducts = sortProducts(products, sortBy);
    displayProducts(sortedProducts);
});
let priceHistogramChart;
let discountVsRatingChart;

// Функция для создания гистограммы цен
function createPriceHistogram(products) {
    const priceRanges = [0, 1000, 2000, 3000, 4000, 5000];
    const priceCounts = new Array(priceRanges.length - 1).fill(0);

    products.forEach(product => {
        for (let i = 0; i < priceRanges.length - 1; i++) {
            if (product.price >= priceRanges[i] && product.price < priceRanges[i + 1]) {
                priceCounts[i]++;
                break;
            }
        }
    });

    const ctx = document.getElementById('priceHistogram').getContext('2d');
    const labels = priceRanges.slice(0, -1).map((range, index) => `${range} - ${priceRanges[index + 1]}`);

    // Если график уже существует, обновим его
    if (priceHistogramChart) {
        priceHistogramChart.data.labels = labels;
        priceHistogramChart.data.datasets[0].data = priceCounts;
        priceHistogramChart.update();
    } else {
        // Создание нового графика
        priceHistogramChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Количество товаров',
                    data: priceCounts,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
            }
        });
    }
}

// Функция для создания линейного графика размера скидки на товар против рейтинга товара
function createDiscountVsRatingChart(products) {
    const discounts = products.map(product => product.price - product.price_discount);
    const ratings = products.map(product => product.rating);

    const ctx = document.getElementById('discountVsRating').getContext('2d');

    // Если график уже существует, обновим его
    if (discountVsRatingChart) {
        discountVsRatingChart.data.labels = ratings;
        discountVsRatingChart.data.datasets[0].data = discounts;
        discountVsRatingChart.update();
    } else {
        // Создание нового графика
        discountVsRatingChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ratings,
                datasets: [{
                    label: 'Размер скидки',
                    data: discounts,
                    fill: false,
                    borderColor: 'rgba(255, 99, 132, 1)'
                }]
            },
            options: {
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Рейтинг товара'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Размер скидки'
                        }
                    }
                }
            }
        });
    }
}

// Обновление графиков при применении фильтров
document.getElementById("filterBtn").addEventListener("click", () => {
    const products = getProducts();
    const filteredProducts = applyFilters(products);
    displayProducts(filteredProducts);
    createPriceHistogram(filteredProducts);
    createDiscountVsRatingChart(filteredProducts);
});

// Обновление графиков при применении сортировки
document.getElementById("sortBtn").addEventListener("click", () => {
    const products = getProducts();
    const sortBy = document.getElementById("sortOptions").value;
    const sortedProducts = sortProducts(products, sortBy);
    displayProducts(sortedProducts);
    createPriceHistogram(sortedProducts);
    createDiscountVsRatingChart(sortedProducts);
});

// Изначально отображаем все продукты и создаем графики
createPriceHistogram(allProducts);
createDiscountVsRatingChart(allProducts);
// Изначально отображаем все продукты из таблицы
const allProducts = getProducts();
displayProducts(allProducts);