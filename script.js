import { lotsOfMembers } from './membres/index.js';

document.addEventListener('DOMContentLoaded', () => {

    // CARTE
    const map = L.map('map').setView([46.603354, 1.888334], 6);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(map);

    // MÉLANGE
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    const shuffledMembers = shuffleArray([...lotsOfMembers]);
    
    // Le compteur avec votre texte personnalisé
    document.getElementById('member-count').innerText = `${shuffledMembers.length} DÉMOCRATE(S) DE COMBAT`;

    const gridContainer = document.getElementById('members-grid');
    const markers = [];

    // BOUTON "NOUS REJOINDRE"
    const addCard = document.createElement('a');
    addCard.href = "inscription.html";
    addCard.className = "group block bg-jaune p-6 border-4 border-black border-dashed hover:bg-black hover:border-jaune transition-all flex flex-col items-center justify-center cursor-pointer min-h-[160px]";
    addCard.innerHTML = `
        <div class="w-12 h-12 bg-black rounded-full flex items-center justify-center mb-2 group-hover:bg-jaune transition-colors border-2 border-white">
            <span class="text-3xl text-jaune group-hover:text-black font-black pb-1">+</span>
        </div>
        <span class="text-black group-hover:text-jaune font-black text-sm uppercase tracking-widest">Nous rejoindre</span>
    `;
    gridContainer.appendChild(addCard);

    // GÉNÉRATION DES MINI-FICHES
    shuffledMembers.forEach(member => {
        const lieu = member.ville; 
        
        const card = document.createElement('div');
        card.className = "bg-white p-5 border-2 border-gray-200 hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(255,237,0,1)] transition-all flex items-start space-x-4 cursor-pointer group";
        
        card.onclick = () => openModal(member);

        card.innerHTML = `
            <img src="${member.photo}" alt="${member.prenom}" class="w-20 h-20 object-cover border-2 border-black shadow-sm group-hover:grayscale transition-all flex-shrink-0 bg-gray-200">
            
            <div class="flex-1 min-w-0 flex flex-col items-start justify-center">
                <h3 class="font-black text-black text-lg leading-tight uppercase truncate w-full">${member.prenom} ${member.nom}</h3>
                
                ${member.nom_code ? `<p class="font-mono text-gray-500 text-xs font-bold uppercase tracking-widest mt-1 bg-gray-100 px-1">CODE: ${member.nom_code}</p>` : ''}
                
                <p class="text-black text-xs mt-2 flex items-center gap-1 font-bold"><i class="fas fa-map-marker-alt text-jaune text-stroke-black"></i> ${lieu}</p>

                ${member.role_supp ? `<span class="inline-block bg-black text-jaune text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide mt-2 border border-black transform -skew-x-6">${member.role_supp}</span>` : ''}
            </div>
        `;
        gridContainer.appendChild(card);

        // --- NOUVEAU : PUCES JAUNES ET NOIRES SUR LA CARTE ---
        if (member.lat && member.lng) {
            const marker = L.circleMarker([member.lat, member.lng], {
                color: '#000000',       // Couleur du contour (Noir)
                fillColor: '#ffed00',   // Couleur de remplissage (Jaune)
                fillOpacity: 1,         // Opacité de remplissage (100% visible)
                opacity: 1,             // Opacité du contour
                weight: 2,              // Épaisseur du contour (en px)
                radius: 8               // Taille du point
            }).addTo(map).bindPopup(`<b>${member.prenom} ${member.nom}</b><br>${member.nom_code || ''}`);
            
            marker.on('click', () => openModal(member));
            markers.push(marker);
        }
    });

    if (markers.length > 0) {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds(), { padding: [50, 50], maxZoom: 12 });
    }
});

// POP-UP / MODALE
function openModal(member) {
    const modal = document.getElementById('profile-modal');
    const content = document.getElementById('modal-content');
    const lieu = member.ville;

    let statsHtml = '';
    if (member.stats) {
        statsHtml = '<div class="grid grid-cols-2 gap-x-8 gap-y-4 mt-6 bg-gray-100 p-6 border-2 border-black">';
        const labels = { bagou: 'Bagou', redac: 'Rédac', terrain: 'Terrain', orga: 'Orga' };
        for (const [key, score] of Object.entries(member.stats)) {
            const percent = score * 20;
            const label = labels[key] || key;
            statsHtml += `
                <div class="flex flex-col">
                    <div class="flex justify-between text-xs text-black mb-1 font-black uppercase tracking-widest">
                        <span>${label}</span>
                        <span>${score}/5</span>
                    </div>
                    <div class="w-full bg-white border border-black h-3 p-0.5">
                        <div class="bg-jaune h-full" style="width: ${percent}%"></div>
                    </div>
                </div>`;
        }
        statsHtml += '</div>';
    }

    let tagsHtml = '';
    if (member.competences && member.competences.length > 0) {
        tagsHtml = '<div class="flex flex-wrap gap-2 mt-4">';
        member.competences.forEach(tag => tagsHtml += `<span class="bg-white text-black text-xs font-bold px-3 py-1 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">${tag}</span>`);
        tagsHtml += '</div>';
    }

    let sujetsHtml = '';
    if (member.sujets_interet && member.sujets_interet.length > 0) {
         sujetsHtml = '<div class="mt-6"><h3 class="font-black text-black uppercase text-sm tracking-widest mb-2 bg-jaune inline-block px-1 transform -rotate-1">Mes Combats</h3><div class="flex flex-wrap gap-2 mt-2">';
         member.sujets_interet.forEach(sujet => sujetsHtml += `<span class="bg-black text-jaune text-xs font-bold px-3 py-1 border border-black">${sujet}</span>`);
         sujetsHtml += '</div></div>';
    }

    const roleHtml = member.role_supp ? `<span class="inline-block bg-black text-jaune text-xs font-bold px-3 py-1 uppercase tracking-wide mb-3 border border-black transform -skew-x-6">${member.role_supp}</span>` : '';

    content.innerHTML = `
        <div class="flex flex-col md:flex-row gap-8 relative">
            <div class="flex flex-col items-center md:items-start md:w-1/3 flex-shrink-0 text-center md:text-left">
                <img src="${member.photo}" class="w-40 h-40 object-cover border-4 border-black shadow-[4px_4px_0px_0px_rgba(255,237,0,1)] mb-5 bg-gray-200">
                
                <h2 class="text-3xl font-black text-black leading-none uppercase">${member.prenom}<br>${member.nom}</h2>
                
                ${member.nom_code ? `<p class="font-mono text-gray-500 font-bold uppercase text-sm tracking-widest mt-2 bg-gray-100 px-2">CODE : ${member.nom_code}</p>` : ''}
                
                <p class="text-black font-bold text-lg mt-4 border-l-4 border-jaune pl-3 leading-tight">${member.poste}</p>
                
                <div class="mt-4">${roleHtml}</div>
                
                <p class="text-gray-500 text-sm flex items-center justify-center md:justify-start gap-2 mt-2 mb-6 font-bold uppercase"><i class="fas fa-map-marker-alt"></i> ${lieu}</p>
                
                ${member.linkedin ? `<a href="${member.linkedin}" target="_blank" class="w-full text-center bg-[#0077b5] text-white font-bold py-2 px-4 border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all shadow-sm mb-3"><i class="fab fa-linkedin mr-2"></i> LinkedIn</a>` : ''}
                
                <div class="w-full flex gap-2 mt-4">
                    <button id="btn-modifier-fiche" class="flex-1 bg-white text-black font-bold py-2 px-2 border-2 border-black text-xs flex items-center justify-center gap-1 hover:bg-jaune transition-colors">
                        <i class="fas fa-pen"></i> ÉDITER
                    </button>
                    <button id="btn-supprimer-fiche" class="flex-1 bg-black text-white font-bold py-2 px-2 border-2 border-black text-xs flex items-center justify-center gap-1 hover:bg-red-600 transition-colors">
                        <i class="fas fa-trash"></i> SUPPR.
                    </button>
                </div>
            </div>

            <div class="md:w-2/3 md:border-l-2 md:border-gray-200 md:pl-8 pt-2">
                ${member.bio ? `<div class="bg-jaune/10 p-6 border-l-4 border-black italic text-gray-900 mb-6 relative"><i class="fas fa-quote-left text-jaune/50 absolute top-2 left-2 text-4xl -z-10"></i><p class="relative z-10 font-medium">"${member.bio}"</p></div>` : ''}
                
                <h3 class="font-black text-black uppercase text-sm tracking-widest mb-2 border-b-2 border-jaune inline-block pb-1">Compétences</h3>
                ${tagsHtml || '<p class="text-gray-400 text-sm italic">Aucune compétence listée</p>'}
                
                ${sujetsHtml}

                <h3 class="font-black text-black uppercase text-sm tracking-widest mt-8 mb-2 border-b-2 border-jaune inline-block pb-1">Super Pouvoirs</h3>
                ${statsHtml}
            </div>
        </div>
    `;

    // BOUTON MODIFIER
    document.getElementById('btn-modifier-fiche').onclick = function() {
        localStorage.setItem('memberToEdit', JSON.stringify(member));
        window.location.href = 'inscription.html';
    };

    // BOUTON SUPPRIMER
    document.getElementById('btn-supprimer-fiche').onclick = async function() {
        if(!confirm(`Êtes-vous SÛRE de vouloir supprimer définitivement ${member.prenom} ${member.nom} ?\n\nCette action est irréversible.`)) return;
        
        const code = prompt("🔒 Sécurité : Entrez le code administrateur (1234) :");
        if (!code) return;

        const btn = document.getElementById('btn-supprimer-fiche');
        btn.innerText = "XXX";
        btn.disabled = true;

        try {
            const response = await fetch('/api/delete-member', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    memberId: member.id, 
                    fileName: `${member.id}.js`,
                    secret: code
                })
            });

            if (response.ok) {
                alert("✅ Agent supprimé.");
                closeModal();
                location.reload(); 
            } else {
                alert("❌ Erreur code.");
                btn.innerText = "ERREUR";
                btn.disabled = false;
            }
        } catch (e) {
            alert("Erreur technique");
        }
    };

    modal.classList.remove('hidden');
}
