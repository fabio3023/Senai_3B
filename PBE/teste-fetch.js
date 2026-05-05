async function main() {
    const resp = await fetch("https://dummyjson.com/posts");
    const json = await resp.json();

    console.log("Quantidade de posts: ", json.posts.length);
    console.log(json.posts[4]);
    console.log("id: ", json.posts[1].id);
}

main();