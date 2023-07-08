const { expressjwt } = require('express-jwt');
 
const authJwt = () => {
  const secret = process.env.secret;
  const api = process.env.API_URL;
  return expressjwt({
    secret,
    algorithms: ['HS256'],
    isRevoked: isRevoked
  }).unless({
    path: [
     { url: /\/public\/uploads(.*)/, methods: ['GET', 'OPTIONS'] },
     { url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS'] },
     { url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS'] },
     { url: /\/api\/v1\/orders(.*)/, methods: ['GET', 'OPTIONS', 'POST'] },
     { url: /\/api\/v1\/users(.*)/, methods:['GET','POST']},
     `${api}/users/login`,
     `${api}/users/register`
      // { url: /(.*)/ }
    ]
  })
}

async function isRevoked(req,payload,done){
 
  if(payload.payload.isAdmin || payload.payload.isInvestor ){
 
    return 
  }else{
    return payload='null'
  }
}

module.exports = authJwt;
