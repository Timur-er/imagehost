export async function getAllUsers() {
    try{
        const response = await fetch('https://jsonplaceholder.typicode.com/posts');
        return await response.json();
    }catch(error) {
        return [];
    }
    
}

/*
fetch('https://jsonplaceholder.typicode.com/posts')
.then((res) => res.json())
.then((data) => {
   console.log(data);
   setPosts(data);
})
.catch((err) => {
   console.log(err.message);
});
*/


export async function createUser(data) {
    const response = await fetch(`/api/user`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user: data})
      })
    return await response.json();
}