const db = require('../config/db');

const newsController = {
    getAllNews: async (req, res) => {
        try {
            const [news] = await db.execute('SELECT * FROM news');
            res.json(news);
        } catch (error) {
            console.error('Error getting news:', error);
            res.status(500).send('Internal Server Error');
        }
    },

    getNewsById: async (req, res) => {
        const { id } = req.params;
        try {
            const [singleNews] = await db.execute('SELECT * FROM news WHERE id = ?', [id]);
            if (singleNews.length > 0) {
                res.json(singleNews[0]);
            } else {
                res.status(404).send('News not found');
            }
        } catch (error) {
            console.error('Error getting news by ID:', error);
            res.status(500).send('Internal Server Error');
        }
    },

    createNews: async (req, res) => {
        const { name, description, image } = req.body;
        try {
            await db.execute('INSERT INTO news (name, description, image) VALUES (?, ?, ?)', [name, description, image]);
            res.json({ message: 'News created successfully' });
        } catch (error) {
            console.error('Error creating news:', error);
            res.status(500).send('Internal Server Error');
        }
    },

    updateNewsById: async (req, res) => {
        const { id } = req.params;
        const { name, description, image } = req.body;
        try {
            if (image) {
                // Cập nhật cả ba trường nếu image được cung cấp
                await db.execute('UPDATE news SET name=?, description=?, image=? WHERE id=?', [name, description, image, id]);
            } else {
                // Chỉ cập nhật name và description nếu image không được cung cấp
                await db.execute('UPDATE news SET name=?, description=? WHERE id=?', [name, description, id]);
            }
            res.json({ message: 'News updated successfully' });
        } catch (error) {
            console.error('Error updating news:', error);
            res.status(500).send('Internal Server Error');
        }
    },
    

    deleteNewsById: async (req, res) => {
        const { id } = req.params;
        try {
            await db.execute('DELETE FROM news WHERE id = ?', [id]);
            res.json({ message: 'News deleted successfully' });
        } catch (error) {
            console.error('Error deleting news:', error);
            res.status(500).send('Internal Server Error');
        }
    },

    searchNews: async (req, res) => {
        const { query } = req.query;
        try {
            const [news] = await db.execute('SELECT * FROM news WHERE name LIKE ? OR description LIKE ?', [`%${query}%`, `%${query}%`]);
            res.json(news);
        } catch (error) {
            console.error('Error searching news:', error);
            res.status(500).send('Internal Server Error');
        }
    },
};

module.exports = newsController;
