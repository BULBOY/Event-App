function search() {
    const artist = document.getElementById('events').value;        

    const filterEvents = hardCodedSongs.filter ( 
        
        song => song.artist == artist
    );

    console.log(`Filtered songs: ${JSON.stringify(filteredSongs)}`);
    

    setSongs(document.getElementById('results').innerHTML=filteredSongs.map(song=>song.title).join('<br>'));

}