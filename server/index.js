const axios = require('axios');
const express = require('express');
const dotenv = require('dotenv');
const querystring = require('querystring')

dotenv.config()
//CONSTANTS
global.access_token = ''
const PORT = process.env.PORT;
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;
const app = express();

const generateRandomString = (length) => {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for(let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
}
app.get('/', (req, res) => {
    res.send("Hello")
})
app.get('/auth/login', (req, res)=>{
    let scope = "streaming user-read-private user-read-email"
    let state = generateRandomString(16)

    const auth_query_parameters = new URLSearchParams({
        response_type: "code",
        client_id: SPOTIFY_CLIENT_ID,
        scope: scope,
        redirect_uri: SPOTIFY_REDIRECT_URI,
        state: state
      })

      res.redirect('https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString())
})

app.get('/auth/callback', async (req, res)=> {
    const code = req.query.code
    const params = querystring.stringify({
        code: code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
        grant_type: 'authorization_code'
      });

    
    var authOptions = {
        auth: {
            username: SPOTIFY_CLIENT_ID,
            password: SPOTIFY_CLIENT_SECRET
        },
        headers: {
            'Content-Type' : 'application/x-www-form-urlencoded'
        },

      };

       axios.post('https://accounts.spotify.com/api/token', 
       params, authOptions).then((response)=>{
        access_token = response.data.access_token
        res.redirect('/')
       }).catch((error) => {
        console.log(error)
       }

       )
       
})

app.get('/refresh_token', (req, res) => {
    const refresh_token = req.query.refresh_token;
    const authOptions = {
        auth: {
            username: SPOTIFY_CLIENT_ID,
            password: SPOTIFY_CLIENT_SECRET
        },
        headers: {
            'Content-Type' : 'application/x-www-form-urlencoded'
        },
    }
    const params = querystring.stringify({
        refresh_token: refresh_token,
        grant_type: 'refresh_token'
      });
    axios.post('https://accounts.spotify.com/api/token', params, authOptions).then().catch()
})
app.get('/auth/token', (req, res)=>{
    res.json({ access_token: access_token})
})

app.listen(PORT, ()=>{
    console.log('App running on port '+ PORT)
})