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

    // --- BOUTON "NOUS REJOINDRE" ---
    const addCard = document.createElement('a');
    addCard.href = "inscription.html";
    addCard.className = "group block bg-gray-50 p-6 rounded-lg border-2 border-dashed border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50 transition-all flex flex-col items-center justify-center cursor-pointer min-h-[400px]";
    addCard.innerHTML = `
        <div class="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-500 transition-colors">
            <span class="text-3xl text-indigo-600 group-hover:text-white font-bold pb-1">+</span>
        </div>
        <span class="text-indigo-600 font-bold text-lg">Nous rejoindre</span>
        <p class="text-center text-gray-500 text-sm mt-2 px-4">Créez votre fiche et apparaissez sur la carte</p>
    `;
    gridContainer.appendChild(addCard);


    // --- GENERATION DES FICHES ---
    shuffledMembers.forEach(member => {
        
        const lieu = member.codePostal ? `${member.codePostal} ${member.ville}` : member.ville;
        
        const roleHtml = member.role_supp 
            ? `<span class="inline-block bg-pink-100 text-pink-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide mt-1">${member.role_supp}</span>` 
            : '';

        // AJOUT DU NOM DE CODE ICI
        const codeNameHtml = member.nom_code
            ? `<p class="text-xs font-mono text-indigo-400 font-bold uppercase tracking-widest mb-1">CODE : ${member.nom_code}</p>`
            : '';

        const bioHtml = member.bio 
            ? `<p class="text-gray-600 text-sm mt-3 italic leading-relaxed">"${member.bio}"</p>` 
            : '';

        let tagsHtml = '';
        if (member.competences && member.competences.length > 0) {
            tagsHtml = '<div class="flex flex-wrap gap-2 mt-3">';
            member.competences.forEach(tag => {
                tagsHtml += `<span class="bg-indigo-50 text-indigo-700 text-xs font-medium px-2 py-1 rounded border border-indigo-100">${tag}</span>`;
            });
            tagsHtml += '</div>';
        }

        let statsHtml = '';
        if (member.stats) {
            statsHtml = '<div class="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 bg-gray-50 p-3 rounded-md">';
            const labels = { bagou: 'Bagou', redac: 'Rédac', terrain: 'Terrain', orga: 'Orga' };
            
            for (const [key, score] of Object.entries(member.stats)) {
                const percent = score * 20;
                const label = labels[key] || key;
                
                statsHtml += `
                    <div class="flex flex-col">
                        <div class="flex justify-between text-xs text-gray-500 mb-1">
                            <span>${label}</span>
                            <span class="font-bold text-gray-700">${score}/5</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-1.5">
                            <div class="bg-indigo-500 h-1.5 rounded-full" style="width: ${percent}%"></div>
                        </div>
                    </div>
                `;
            }
            statsHtml += '</div>';
        }

        const socialHtml = member.linkedin 
            ? `<div class="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                 <a href="${member.linkedin}" target="_blank" class="text-indigo-600 hover:text-indigo-800 text-sm font-semibold flex items-center">
                    Voir le profil LinkedIn →
                 </a>
               </div>`
            : '';


        const card = document.createElement('div');
        card.className = "bg-white p-6 rounded-xl shadow hover:shadow-lg transition-all border border-gray-100 flex flex-col";
        
        card.innerHTML = `
            <div class="flex items-start space-x-4">
                <img src="${member.photo}" alt="${member.prenom}" class="w-16 h-16 rounded-full object-cover border-2 border-indigo-100 shadow-sm">
                <div class="flex-1">
                    ${codeNameHtml} <h3 class="font-bold text-gray-900 text-lg leading-tight">${member.prenom} ${member.nom}</h3>
                    <p class="text-indigo-600 text-sm font-medium">${member.poste}</p>
                    ${roleHtml}
                    <p class="text-gray-400 text-xs mt-1 flex items-center gap-1">📍 ${lieu}</p>
                </div>
            </div>
            
            ${bioHtml}
            ${tagsHtml}
            ${statsHtml}
            
            <div class="mt-auto">
                ${socialHtml}
            </div>
        `;
        
        gridContainer.appendChild(card);

        if (member.lat && member.lng) {
            const marker = L.marker([member.lat, member.lng])
                .addTo(map)
                .bindPopup(`<b>${member.prenom} ${member.nom}</b><br>${member.nom_code ? member.nom_code : member.poste}`);
            markers.push(marker);
        }
    });

    if (markers.length > 0) {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds(), { padding: [50, 50], maxZoom: 12 });
    }
});
