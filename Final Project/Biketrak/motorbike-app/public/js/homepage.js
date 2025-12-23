document.addEventListener('DOMContentLoaded', function() {
    const motorbikeGrid = document.getElementById('motorbikeGrid');
    const searchBar = document.getElementById('searchBar');
    const logoutButton = document.getElementById('logoutButton');

    searchBar.addEventListener('input', fetchMotorbikes);

    logoutButton.addEventListener('click', async function() {
        const token = localStorage.getItem('token');

        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            localStorage.removeItem('token');
            window.location.href = 'login2.html';
        } else {
            const errorText = await response.text();
            alert(`Error: ${errorText}`);
        }
    });

    async function fetchMotorbikes() {
        const search = searchBar.value;
        const response = await fetch(`/api/motorbikes?search=${search}`);
        const motorbikes = await response.json();

        motorbikeGrid.innerHTML = '';
        motorbikes.forEach(motorbike => {
            const motorbikeCard = document.createElement('div');
            motorbikeCard.className = 'motorbike-card bg-white p-4 rounded-lg border border-zinc-200 hover:border-red-500 transition-all group relative shadow-md';
            motorbikeCard.setAttribute('data-name', motorbike.name);
            motorbikeCard.setAttribute('data-brand', motorbike.brand);
            motorbikeCard.setAttribute('data-cc', motorbike.cc);
            motorbikeCard.setAttribute('data-price', motorbike.price);

            motorbikeCard.innerHTML = `
                <a href="motorbike.html?id=${motorbike._id}" class="block">
                    <div class="relative">
                        <img src="${motorbike.imageUrl}" alt="${motorbike.name}" class="w-full h-40 rounded-lg mb-2 object-cover group-hover:scale-105 transition-transform"/>
                    </div>
                    <h3 class="text-center text-zinc-800 font-semibold">${motorbike.name}</h3>
                    <p class="text-center text-zinc-600">Brand: ${motorbike.brand}</p>
                    <p class="text-center text-zinc-600">CC: ${motorbike.cc}</p>
                    <p class="text-center text-zinc-600">Price: $${motorbike.price}</p>
                </a>
            `;

            motorbikeGrid.appendChild(motorbikeCard);
        });
    }

    fetchMotorbikes(); // Initial fetch
});