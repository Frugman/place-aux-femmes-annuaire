document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Initialisation de la carte (Centrée sur la France par défaut)
    const map = L.map('map').setView([46.603354, 1.888334], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // 2. Fonction de mélange aléatoire (Fisher-Yates Shuffle)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // 3. Récupération et mélange des données
    // On utilise "lotsOfMembers" défini dans data.js
    const shuffledMembers = shuffleArray([...lotsOfMembers]); 

    // Mise à jour du compteur
    document.getElementById('member-count').innerText = `${shuffledMembers.length} membre(s) actif(s)`;

    const gridContainer = document.getElementById('members-grid');
    const markers = []; // Pour stocker les marqueurs de la carte

    // 4. Génération des cartes et des marqueurs
    shuffledMembers.forEach(member => {
        
        // Préparation de l'affichage du lieu (avec ou sans Code Postal)
        const lieuAffichage = member.codePostal ? `${member.codePostal} ${member.ville}` : member.ville;

        // Préparation de l'affichage du rôle supplémentaire (ex: Co-référente)
        // On ne l'affiche que s'il est rempli dans data.js
        const roleSuppHtml = member.role_supp 
            ? `<p class="text-pink-600 text-xs font-bold uppercase tracking-wide mt-1">${member.role_supp}</p>` 
            : '';

        // --- Création de la Carte HTML ---
        const card = document.createElement('div');
        card.className = "bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow flex items-center space-x-4 border border-gray-100";
        
        card.innerHTML = `
            <img src="${member.photo}" alt="${member.prenom}" class="w-16 h-16 rounded-full object-cover border-2 border-indigo-100">
            <div>
                <h3 class="font-bold text-gray-900 text-lg">${member.prenom} ${member.nom}</h3>
                <p class="text-indigo-600 text-sm font-medium">${member.job}</p>
                ${roleSuppHtml}
                <p class="text-gray-500 text-xs mt-1">📍 ${lieuAffichage}</p>
            </div>
        `;
        gridContainer.appendChild(card);

        // --- Ajout du Marqueur sur la Map ---
        if (member.lat && member.lng) {
            const markerContent = `
                <b>${member.prenom} ${member.nom}</b><br>
                ${member.job}<br>
                ${member.role_supp ? `<em>${member.role_supp}</em>` : ''}
            `;

            const marker = L.marker([member.lat, member.lng])
                .addTo(map)
                .bindPopup(markerContent);
            markers.push(marker);
        }
    });

    // Si on a un seul membre, on centre la carte directement dessus
    if (markers.length === 1) {
         const group = new L.featureGroup(markers);
         map.fitBounds(group.getBounds(), {maxZoom: 12});
    }
});
