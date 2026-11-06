const fs = require('fs');
const content = fs.readFileSync('src/app/api/research/chat/delete_chat/[id]/route.ts', 'utf8');
console.log(content);
