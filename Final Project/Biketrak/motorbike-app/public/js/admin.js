document.addEventListener('DOMContentLoaded', function() {
    const createForm = document.getElementById('createForm');
    const motorbikeGrid = document.getElementById('motorbikeGrid');

    createForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const formData = new FormData(createForm);
        const token = localStorage.getItem('token');

        const response = await fetch('/api/motorbikes', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (response.ok) {
            alert('Motorbike created successfully!');
            fetchMotorbikes();
            createForm.reset();
        } else {
            const errorText = await response.text();
            alert(`Error: ${errorText}`);
        }
    });

    async function fetchMotorbikes() {
        const response = await fetch('/api/motorbikes');
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
                <div class="absolute top-2 left-2 z-10">
                    <button class="delete-btn bg-red-500 text-white p-1 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600" onclick="deleteMotorbike('${motorbike._id}')">
                        <i class="fas fa-trash text-sm"></i>
                    </button>
                </div>
                <div class="absolute top-2 right-2 z-10">
                    <button class="edit-btn bg-blue-500 text-white p-1 rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-600" onclick="editMotorbike('${motorbike._id}')">
                        <i class="fas fa-edit text-sm"></i>
                    </button>
                </div>
                <div class="relative">
                    <img src="${motorbike.imageUrl}" alt="${motorbike.name}" class="w-full h-40 rounded-lg mb-2 object-cover group-hover:scale-105 transition-transform"/>
                </div>
                <h3 class="text-center text-zinc-800 font-semibold">${motorbike.name}</h3>
                <p class="text-center text-zinc-600">Brand: ${motorbike.brand}</p>
                <p class="text-center text-zinc-600">CC: ${motorbike.cc}</p>
                <p class="text-center text-zinc-600">Price: $${motorbike.price}</p>
            `;

            motorbikeGrid.appendChild(motorbikeCard);
        });
    }

    fetchMotorbikes(); // Initial fetch

    window.deleteMotorbike = async function(id) {
        if (confirm('Are you sure you want to delete this motorbike?')) {
            const token = localStorage.getItem('token');
            await fetch(`/api/motorbikes/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchMotorbikes();
        }
    };

    window.editMotorbike = function(id) {
        window.location.href = `edit.html?id=${id}`;
    };
});