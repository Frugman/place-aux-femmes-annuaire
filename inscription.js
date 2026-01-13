document.addEventListener('DOMContentLoaded', () => {
    
    // --- GESTION DU MODE MODIFIER ---
    const memberToEditData = localStorage.getItem('memberToEdit');
    if (memberToEditData) {
        try {
            const member = JSON.parse(memberToEditData);
            const setVal = (id, val) => { if(document.getElementById(id)) document.getElementById(id).value = val || ''; };
            
            setVal('prenom', member.prenom);
            setVal('nom', member.nom);
            setVal('nom_code', member.nom_code);
            setVal('poste', member.poste);
            setVal('role_supp', member.role_supp);
            setVal('ville', member.ville);
            // Plus de code postal
            setVal('bio', member.bio);
            setVal('photo', member.photo);
            setVal('linkedin', member.linkedin);
            setVal('email', member.email);

            if (member.competences && Array.isArray(member.competences)) {
                document.getElementById('competences').value = member.competences.join(', ');
            }
            if (member.sujets_interet && Array.isArray(member.sujets_interet)) {
                document.getElementById('sujets_interet').value = member.sujets_interet.join(', ');
            }
            
            const stats = member.stats || {};
            const setSlider = (id, val) => { 
                document.getElementById(id).value = val || 3;
                document.getElementById('val_'+id).innerText = (val || 3) + '/5';
            };
            setSlider('bagou', stats.bagou);
            setSlider('redac', stats.redac);
            setSlider('terrain', stats.terrain);
            setSlider('orga', stats.orga);

            document.querySelector('h1').innerText = "ÉDITION : " + (member.prenom || 'AGENT').toUpperCase();
            const btn = document.querySelector('button[type="submit"]');
            btn.innerText = "METTRE À JOUR MA FICHE ♀";
        } catch (e) { console.error("Erreur chargement profil", e); }
        localStorage.removeItem('memberToEdit');
    }

    window.updateSliderVal = function(id, val) {
        document.getElementById('val_' + id).innerText = val + '/5';
    }

    // --- ENVOI DU FORMULAIRE ---
    const form = document.getElementById('inscriptionForm');
    if(!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerText;
        btn.innerText = "📍 Recherche de la ville..."; 
        btn.disabled = true;
        btn.classList.add('opacity-50', 'cursor-not-allowed');

        const getVal = (id) => document.getElementById(id).value.trim();
        const prenom = getVal('prenom');
        const nom = getVal('nom');
        const ville = getVal('ville');
        // Pas de code postal
        let photo = getVal('photo');
        
        if (!photo) photo = "https://ui-avatars.com/api/?name=" + prenom + "+" + nom + "&background=random&color=fff&size=256";

        const makeArray = (id) => getVal(id).split(',').map(s => s.trim()).filter(s => s.length > 0);
        
        const stats = {
            bagou: parseInt(document.getElementById('bagou').value) || 3,
            redac: parseInt(document.getElementById('redac').value) || 3,
            terrain: parseInt(document.getElementById('terrain').value) || 3,
            orga: parseInt(document.getElementById('orga').value) || 3
        };

        // --- GÉOCODAGE AUTOMATIQUE (Ville uniquement) ---
        let lat = 'null';
        let lng = 'null';
        
        try {
            const urlGeo = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(ville)}&limit=1`;
            const resGeo = await fetch(urlGeo);
            const dataGeo = await resGeo.json();

            if (dataGeo.features && dataGeo.features.length > 0) {
                const coords = dataGeo.features[0].geometry.coordinates;
                lng = coords[0];
                lat = coords[1];
                btn.innerText = "✅ Ville trouvée ! Envoi...";
            } else {
                console.warn("Ville introuvable par le GPS");
                btn.innerText = "⚠️ Ville inconnue, envoi quand même...";
            }
        } catch (err) {
            console.error("Erreur GPS :", err);
        }

        const idGenerated = (prenom + nom).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
        const fileName = `${idGenerated}.js`;
        
        const fileContent = `export const ${idGenerated} = {
    id: "${idGenerated}",
    prenom: "${prenom}",
    nom: "${nom}",
    nom_code: "${getVal('nom_code')}",
    poste: "${getVal('poste')}",
    role_supp: "${getVal('role_supp')}",
    ville: "${getVal('ville')}",
    lat: ${lat},
    lng: ${lng},
    photo: "${photo}",
    bio: "${getVal('bio').replace(/"/g, '\\"')}",
    competences: ${JSON.stringify(makeArray('competences'))},
    sujets_interet: ${JSON.stringify(makeArray('sujets_interet'))},
    stats: ${JSON.stringify(stats, null, 8).replace("}", "    }")},
    linkedin: "${getVal('linkedin')}",
    email: "${getVal('email')}"
};`;

        try {
            const response = await fetch('/api/save-member', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    fileName, 
                    fileContent,
                    memberId: idGenerated
                })
            });

            const result = await response.json();

            if (response.ok) {
                alert("✅ Fiche créée/mise à jour !\n\nL'annuaire va se rafraîchir dans 1 minute.");
                window.location.href = 'index.html';
            } else {
                throw new Error(result.message || "Erreur inconnue");
            }

        } catch (error) {
            console.error(error);
            alert("❌ Erreur : " + error.message);
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
            btn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    });
});
