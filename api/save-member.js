module.exports = async (req, res) => {
    // 1. Sécurité
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Méthode non autorisée' });
    }

    const { fileName, fileContent } = req.body;
    
    // 2. Variables d'environnement
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_REPO_OWNER;
    const repo = process.env.GITHUB_REPO_NAME;

    if (!token || !owner || !repo) {
        return res.status(500).json({ message: 'Configuration serveur incomplète' });
    }

    try {
        const path = `membres/${fileName}`;
        const message = `Nouvelle inscription : ${fileName}`;
        // GitHub veut du base64
        const content = Buffer.from(fileContent).toString('base64');

        // 3. Appel GitHub
        // On utilise node-fetch intégré ou le fetch natif selon la version, 
        // ce code est compatible avec les deux.
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Place-Aux-Femmes-App'
            },
            body: JSON.stringify({
                message: message,
                content: content
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erreur GitHub');
        }

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error("Erreur API:", error);
        return res.status(500).json({ message: error.message });
    }
};
