/*
document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const motorbikeId = urlParams.get('id');
    const motorbikeDetails = document.getElementById('motorbikeDetails');

    try {
        const response = await fetch(`/api/motorbikes/${motorbikeId}`);
        const motorbike = await response.json();

        motorbikeDetails.innerHTML = `
            <img src="${motorbike.imageUrl}" alt="${motorbike.name}" class="w-full h-60 object-cover rounded-md mb-4">
            <h2 class="text-3xl font-bold text-zinc-800 mb-2">${motorbike.name}</h2>
            <p class="text-zinc-600 mb-2">Brand: ${motorbike.brand}</p>
            <p class="text-zinc-600 mb-2">CC: ${motorbike.cc}</p>
            <p class="text-zinc-600 mb-2">Price: $${motorbike.price}</p>
            <p class="text-zinc-600">${motorbike.description}</p>
        `;
    } catch (error) {
        console.error('Error fetching motorbike details:', error);
        motorbikeDetails.innerHTML = '<p class="text-red-500">Error fetching motorbike details.</p>';
    }
});

*/
// This file fetches a motorbike by id from query string, renders details,
// provides an Edit button and sends PUT to /api/motorbikes/:id with FormData.

(async function () {
    const detailsEl = document.getElementById('motorbikeDetails');
    const editContainer = document.getElementById('editContainer');
    const editForm = document.getElementById('editForm');
    const editMsg = document.getElementById('editMsg');
    const currentImagePreview = document.getElementById('currentImagePreview');

    function getIdFromQuery() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id') || params.get('_id') || null;
    }

    const id = getIdFromQuery();
    if (!id) {
        detailsEl.innerHTML = '<p class="text-red-600">No motorbike id provided in URL. Add ?id=&lt;ID&gt;</p>';
        return;
    }

    const token = localStorage.getItem('token');

    async function fetchMotorbike() {
        try {
            const res = await fetch(`/api/motorbikes/${id}`, { headers: token ? { 'Authorization': 'Bearer ' + token } : {} });
            if (!res.ok) throw new Error('Failed to fetch motorbike: ' + res.status);
            const data = await res.json();
            renderDetails(data);
        } catch (err) {
            console.error(err);
            detailsEl.innerHTML = `<p class="text-red-600">Error loading motorbike: ${err.message}</p>`;
        }
    }

    function renderDetails(m) {
        const imgHtml = m.imageUrl ? `<img src="${m.imageUrl}" alt="${escapeHtml(m.name)}" class="w-full max-w-md rounded-md mb-4">` : '';
        detailsEl.innerHTML = `
            <div class="flex flex-col md:flex-row gap-6">
                <div class="flex-1">${imgHtml}</div>
                <div class="flex-1">
                    <h2 class="text-2xl font-bold text-sky-700 mb-2">${escapeHtml(m.name || '')}</h2>
                    <p class="text-sm text-gray-600 mb-1"><strong>Brand:</strong> ${escapeHtml(m.brand || '')}</p>
                    <p class="text-sm text-gray-600 mb-1"><strong>CC:</strong> ${m.cc || ''}</p>
                    <p class="text-sm text-gray-600 mb-1"><strong>Price:</strong> ${m.price || ''}</p>
                    <p class="mt-3 text-gray-800">${escapeHtml(m.description || '')}</p>

                    <div class="mt-4 flex space-x-2">
                        <button id="editBtn" class="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700">Edit</button>
                        <button id="deleteBtn" class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">Delete</button>
                    </div>
                    <div id="actionMsg" class="mt-2"></div>
                </div>
            </div>
        `;

        const editBtn = document.getElementById('editBtn');
        const deleteBtn = document.getElementById('deleteBtn');
        editBtn && editBtn.addEventListener('click', () => showEdit(m));
        deleteBtn && deleteBtn.addEventListener('click', () => handleDelete(m._id));
    }

    function showEdit(m) {
        // fill form
        document.getElementById('edit_name').value = m.name || '';
        document.getElementById('edit_brand').value = m.brand || '';
        document.getElementById('edit_cc').value = m.cc || '';
        document.getElementById('edit_price').value = m.price || '';
        document.getElementById('edit_description').value = m.description || '';
        currentImagePreview.innerHTML = m.imageUrl ? `<img src="${m.imageUrl}" class="w-48 rounded-md" alt="current">` : '<span class="text-gray-500">No image</span>';

        editMsg.textContent = '';
        editContainer.classList.remove('hidden');
        window.scrollTo({ top: editContainer.offsetTop - 20, behavior: 'smooth' });
    }

    editForm && editForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        editMsg.textContent = 'Saving...';
        const fd = new FormData(editForm);
        // ensure fields present even if empty
        fd.set('name', document.getElementById('edit_name').value || '');
        fd.set('brand', document.getElementById('edit_brand').value || '');
        fd.set('cc', document.getElementById('edit_cc').value || '');
        fd.set('price', document.getElementById('edit_price').value || '');
        fd.set('description', document.getElementById('edit_description').value || '');

        try {
            const opts = { method: 'PUT', body: fd };
            if (token) {
                opts.headers = { 'Authorization': 'Bearer ' + token }; // do not set Content-Type
            }
            const res = await fetch(`/api/motorbikes/${id}`, opts);
            const json = await res.json().catch(() => null);
            if (!res.ok) {
                editMsg.textContent = 'Error: ' + (json?.error || json?.message || res.status);
                editMsg.className = 'text-red-600 mt-2';
                return;
            }
            editMsg.textContent = 'Updated successfully';
            editMsg.className = 'text-green-600 mt-2';
            editContainer.classList.add('hidden');
            // refresh displayed details
            await fetchMotorbike();
        } catch (err) {
            console.error(err);
            editMsg.textContent = 'Network error: ' + err.message;
            editMsg.className = 'text-red-600 mt-2';
        }
    });

    document.getElementById('cancelEdit')?.addEventListener('click', function () {
        editContainer.classList.add('hidden');
    });

    async function handleDelete(_id) {
        if (!confirm('Delete this motorbike?')) return;
        const actionMsg = document.getElementById('actionMsg');
        actionMsg.textContent = 'Deleting...';
        try {
            const res = await fetch(`/api/motorbikes/${_id}`, {
                method: 'DELETE',
                headers: token ? { 'Authorization': 'Bearer ' + token } : {}
            });
            if (!res.ok) {
                const j = await res.json().catch(() => null);
                actionMsg.textContent = 'Delete failed: ' + (j?.error || res.status);
                actionMsg.className = 'text-red-600 mt-2';
                return;
            }
            actionMsg.textContent = 'Deleted. Redirecting...';
            actionMsg.className = 'text-green-600 mt-2';
            setTimeout(() => { window.location.href = '/homepage6.html'; }, 1000);
        } catch (err) {
            console.error(err);
            actionMsg.textContent = 'Network error: ' + err.message;
            actionMsg.className = 'text-red-600 mt-2';
        }
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/[&<>"']/g, (s) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
    }

    // initial load
    fetchMotorbike();
})();