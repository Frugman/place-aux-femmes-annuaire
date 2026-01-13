document.addEventListener('DOMContentLoaded', () => {

    const map = L.map('map').setView([46.603354, 1.888334], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    const shuffledMembers = shuffleArray([...lotsOfMembers]);
    document.getElementById('member-count').innerText = `${shuffledMembers.length} membre(s) actif(s)`;

    const gridContainer = document.getElementById('members-grid');
    const markers = [];

    // --- BOUTON "NOUS REJOINDRE" (Reste inchangé) ---
    const addCard = document.createElement('a');
    addCard.href = "inscription.html";
    addCard.className = "group block bg-gray-50 p-6 rounded-lg border-2 border-dashed border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50 transition-all flex flex-col items-center justify-center cursor-pointer min-h-[180px]";
    addCard.innerHTML = `
        <div class="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-indigo-500 transition-colors">
            <span class="text-2xl text-indigo-600 group-hover:text-white font-bold pb-1">+</span>
        </div>
        <span class="text-indigo-600 font-bold text-sm">Nous rejoindre</span>
    `;
    gridContainer.appendChild(addCard);


    // --- GÉNÉRATION DES CARTES "MINI" ---
    shuffledMembers.forEach(member => {
        
        // Données simples pour la carte
        const lieu = member.codePostal ? `${member.codePostal} ${member.ville}` : member.ville;
        
        const roleHtml = member.role_supp 
            ? `<span class="inline-block bg-pink-100 text-pink-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide mt-2">${member.role_supp}</span>` 
            : '';

        const codeNameHtml = member.nom_code
            ? `<p class="text-xs font-mono text-indigo-400 font-bold uppercase tracking-widest mb-1">CODE : ${member.nom_code}</p>`
            : '';

        const card = document.createElement('div');
        // "cursor-pointer" indique que c'est cliquable
        card.className = "bg-white p-5 rounded-xl shadow hover:shadow-lg transition-all border border-gray-100 flex flex-col items-start cursor-pointer group hover:border-indigo-300";
        
        // On attache l'événement CLIC pour ouvrir la pop-up
        card.onclick = () => openModal(member);

        card.innerHTML = `
            <div class="flex items-center space-x-4 w-full">
                <img src="${member.photo}" alt="${member.prenom}" class="w-16 h-16 rounded-full object-cover border-2 border-indigo-100 shadow-sm group-hover:border-indigo-400 transition-colors">
                <div class="flex-1 min-w-0">
                    ${codeNameHtml}
                    <h3 class="font-bold text-gray-900 text-lg truncate">${member.prenom} ${member.nom}</h3>
                    <p class="text-indigo-600 text-sm font-medium truncate">${member.poste}</p>
                    <p class="text-gray-400 text-xs mt-1">📍 ${lieu}</p>
                </div>
            </div>
            ${roleHtml}
        `;
        
        gridContainer.appendChild(card);

        // --- MAP (Reste inchangée) ---
        if (member.lat && member.lng) {
            const marker = L.marker([member.lat, member.lng])
                .addTo(map)
                .bindPopup(`<b>${member.prenom} ${member.nom}</b><br>${member.poste}`);
            
            // Si on clique sur le point de la carte, ça ouvre aussi la pop-up !
            marker.on('click', () => {
                openModal(member);
            });
            
            markers.push(marker);
        }
    });

    if (markers.length > 0) {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds(), { padding: [50, 50], maxZoom: 12 });
    }
});


// --- FONCTION POUR OUVRIR LA POP-UP (MODALE) ---
function openModal(member) {
    const modal = document.getElementById('profile-modal');
    const content = document.getElementById('modal-content');
    const lieu = member.codePostal ? `${member.codePostal} ${member.ville}` : member.ville;

    // Préparation HTML des Jauges
    let statsHtml = '';
    if (member.stats) {
        statsHtml = '<div class="grid grid-cols-2 gap-x-6 gap-y-3 mt-6 bg-gray-50 p-4 rounded-lg">';
        const labels = { bagou: 'Bagou', redac: 'Rédac', terrain: 'Terrain', orga: 'Orga' };
        for (const [key, score] of Object.entries(member.stats)) {
            const percent = score * 20;
            const label = labels[key] || key;
            statsHtml += `
                <div class="flex flex-col">
                    <div class="flex justify-between text-xs text-gray-500 mb-1">
                        <span class="uppercase font-bold tracking-wider">${label}</span>
                        <span class="font-bold text-indigo-600">${score}/5</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-indigo-600 h-2 rounded-full" style="width: ${percent}%"></div>
                    </div>
                </div>
            `;
        }
        statsHtml += '</div>';
    }

    // Préparation HTML des Tags
    let tagsHtml = '';
    if (member.competences && member.competences.length > 0) {
        tagsHtml = '<div class="flex flex-wrap gap-2 mt-4">';
        member.competences.forEach(tag => {
            tagsHtml += `<span class="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-100">${tag}</span>`;
        });
        tagsHtml += '</div>';
    }

    // Préparation HTML du Rôle Supp
    const roleHtml = member.role_supp 
        ? `<span class="inline-block bg-pink-100 text-pink-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-3">${member.role_supp}</span>` 
        : '';

    // INJECTION DU CONTENU COMPLET
    content.innerHTML = `
        <div class="flex flex-col md:flex-row gap-6">
            <div class="flex flex-col items-center md:items-start md:w-1/3">
                <img src="${member.photo}" class="w-32 h-32 rounded-full object-cover border-4 border-indigo-100 shadow-lg mb-4">
                
                ${member.nom_code ? `<p class="font-mono text-indigo-500 font-bold uppercase text-sm tracking-widest mb-1">CODE : ${member.nom_code}</p>` : ''}
                
                <h2 class="text-2xl font-bold text-gray-900 text-center md:text-left leading-tight">${member.prenom} ${member.nom}</h2>
                <p class="text-indigo-600 font-medium text-lg text-center md:text-left mb-2">${member.poste}</p>
                
                ${roleHtml}
                
                <p class="text-gray-500 text-sm flex items-center gap-1 mt-1">
                    <i class="fas fa-map-marker-alt"></i> ${lieu}
                </p>

                ${member.linkedin ? `
                    <a href="${member.linkedin}" target="_blank" class="mt-6 w-full text-center bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition-colors">
                        LinkedIn
                    </a>` : ''}
            </div>

            <div class="md:w-2/3 md:border-l md:border-gray-100 md:pl-6">
                ${member.bio ? `
                    <div class="bg-indigo-50/50 p-4 rounded-lg border-l-4 border-indigo-300 italic text-gray-700 mb-6">
                        "${member.bio}"
                    </div>
                ` : ''}

                <h3 class="font-bold text-gray-900 uppercase text-xs tracking-wider mb-2">Compétences</h3>
                ${tagsHtml || '<p class="text-gray-400 text-sm italic">Aucune compétence listée</p>'}

                <h3 class="font-bold text-gray-900 uppercase text-xs tracking-wider mt-6 mb-2">Statistiques Agent</h3>
                ${statsHtml}
            </div>
        </div>
    `;

    // On affiche la modale
    modal.classList.remove('hidden');
}
