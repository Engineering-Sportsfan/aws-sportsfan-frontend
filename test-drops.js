const axios = require('axios');

async function test() {
    try {
        const [audioRes, videoRes, articleRes] = await Promise.all([
            axios.get("https://api.sportsfan360.com/api/cloudinary/audio?limit=200"),
            axios.get("https://api.sportsfan360.com/api/cloudinary/video?limit=200"),
            axios.get("https://api.sportsfan360.com/api/cricket-articles?limit=200")
        ]);

        console.log("Audio items:", audioRes.data?.audioFiles?.length || 0);
        console.log("Video items:", videoRes.data?.videoFiles?.length || 0);
        console.log("Article items:", articleRes.data?.articles?.length || 0);
    } catch (e) {
        console.error(e.message);
    }
}
test();
