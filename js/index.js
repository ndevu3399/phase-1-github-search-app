document.addEventListener("DOMContentLoaded", () => {
    const searchForm = document.getElementById("search-form");
    const searchInput = document.getElementById("search-input");
    const resultsContainer = document.getElementById("results");
    const toggleButton = document.getElementById("toggle-search");
    let searchType = "user"; // Default to searching users

    toggleButton.addEventListener("click", () => {
        searchType = searchType === "user" ? "repo" : "user";
        toggleButton.textContent = `Search by ${searchType === "user" ? "Users" : "Repositories"}`;
    });

    searchForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (!query) return;

        resultsContainer.innerHTML = "<p>Loading...</p>";
        const url = searchType === "user"
            ? `https://api.github.com/search/users?q=${query}`
            : `https://api.github.com/search/repositories?q=${query}`;

        try {
            const response = await fetch(url, {
                headers: { "Accept": "application/vnd.github.v3+json" }
            });
            const data = await response.json();
            displayResults(data.items);
        } catch (error) {
            resultsContainer.innerHTML = "<p>Error fetching data.</p>";
        }
    });

    function displayResults(items) {
        resultsContainer.innerHTML = "";
        if (!items || items.length === 0) {
            resultsContainer.innerHTML = "<p>No results found.</p>";
            return;
        }

        items.forEach(item => {
            const div = document.createElement("div");
            div.classList.add("result-item");
            if (searchType === "user") {
                div.innerHTML = `
                    <img src="${item.avatar_url}" alt="${item.login}" width="50">
                    <a href="${item.html_url}" target="_blank">${item.login}</a>
                    <button data-username="${item.login}" class="view-repos">View Repos</button>
                `;
            } else {
                div.innerHTML = `
                    <a href="${item.html_url}" target="_blank">${item.full_name}</a>
                    <p>${item.description || "No description available."}</p>
                `;
            }
            resultsContainer.appendChild(div);
        });

        document.querySelectorAll(".view-repos").forEach(button => {
            button.addEventListener("click", (e) => {
                fetchUserRepos(e.target.dataset.username);
            });
        });
    }

    async function fetchUserRepos(username) {
        resultsContainer.innerHTML = "<p>Loading repositories...</p>";
        const url = `https://api.github.com/users/${username}/repos`;

        try {
            const response = await fetch(url, {
                headers: { "Accept": "application/vnd.github.v3+json" }
            });
            const repos = await response.json();
            displayRepos(repos);
        } catch (error) {
            resultsContainer.innerHTML = "<p>Error fetching repositories.</p>";
        }
    }

    function displayRepos(repos) {
        resultsContainer.innerHTML = "";
        if (!repos || repos.length === 0) {
            resultsContainer.innerHTML = "<p>No repositories found.</p>";
            return;
        }

        repos.forEach(repo => {
            const div = document.createElement("div");
            div.classList.add("repo-item");
            div.innerHTML = `
                <a href="${repo.html_url}" target="_blank">${repo.name}</a>
                <p>${repo.description || "No description available."}</p>
            `;
            resultsContainer.appendChild(div);
        });
    }
});
