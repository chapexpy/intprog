r = require('rethinkdb');   
(async () => {
    try {
        const connection = await r.connect( {host: 'localhost', port: 28015}) 
        
        const table = await r.db('test').tableCreate('contact_forms').run(connection)
        
    } catch (error) {
        console.log(error)
    }

})()