const axios = require('axios');
(async () => {
  try {
    const res = await axios.get("https://sportsfan360.vercel.app/api/roar/posts");
    console.log(JSON.stringify(res.data.posts[0], null, 2));
  } catch (e) {
    console.error(e.message);
  }
})();
