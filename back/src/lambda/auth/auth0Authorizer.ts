import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = process.env.AUTH_0_JWKS
let cachedCertificate: string

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  logger.info('verifyToken', {'token': token })

  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  logger.info('decodedToken', {'jwt': jwt })

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/

  const cert = await getCertificate()
//   const cert = `-----BEGIN CERTIFICATE-----\nMIIDHTCCAgWgAwIBAgIJB0Ayhbb7e0biMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV\nBAMTIWRldi0wbThiY25vdm8yaHR6aGUzLnVzLmF1dGgwLmNvbTAeFw0yMzAxMjQx\nMjUyMjhaFw0zNjEwMDIxMjUyMjhaMCwxKjAoBgNVBAMTIWRldi0wbThiY25vdm8y\naHR6aGUzLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC\nggEBAO6foxux+MdKWQxzv5iQRHhDPCqnbagUpHDBULp+/S/aIoMHuXKD7UQuenUf\nxVPbqDJsAgqZ48snP4rzg7DodbYiv4RwKZ8eGy9/Vtr9LX5pXH7KFHCI6K3sR0xx\n/F+2ELtmq4BMvKoJ+kWNQoBrdcsW+jkScLwjhLfedMvulkEDE+q+1ck7WCv9oqvk\n/84eijS/c80MSgl+XyQDoEly9ht8/hZL21A4y2bZtP9UObSZ7ViBikdffeenhdsW\nBjXWsF3ZfML6UspwZIbXuTEww9D5umCa2EvgxHe1YARM0v/fLkCspMCRhLv+p7tO\n9tKuuxBKeYDWds5R3vgnnt8TA+sCAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd\nBgNVHQ4EFgQUnsWUuhIcS7bnhQU2G54Jodv4T3AwDgYDVR0PAQH/BAQDAgKEMA0G\nCSqGSIb3DQEBCwUAA4IBAQA+oWbpniIVeyN+A9Ee9QY0KccBDp3TfY1r7pbqgm4z\nGyVF0B/xgkRjR6ipMyyP6O5F/CFzp7f/BoxjmJ1/o5g6gvCI1bO/AyVsOJByU2/8\nIttvM5t9TxNHjjAnshd13RU2+HPrdpuSpUSfReu6Qv8z6TvxcMJ3EwEtq7pU3Pl/\nnSjTeWBSC4kGNm1wfctrczgSRt5hOwqoYirUwxBP4oaG8qU4F7c2VWWWMow30blF\nK+v3dIqSH4F6vyrHCcfX4FOfw7pSR+Dde7/rGZxXlWf543z8y9Fso7id+FyQKphF\n2+7/4ku02UfN19Bv55Hs4Gd4Ih4a7J6v9k+A9hWzhpzv\n-----END CERTIFICATE-----\n`
  logger.info('decodedToken2', {'token': token })
  logger.info('decodedToken3', {'cert': cert })

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  logger.info('getToken', {'tok': token })
  return token
}

async function getCertificate(): Promise<string> {
  if (cachedCertificate) return cachedCertificate
  logger.info('getCertificate1', {'url': jwksUrl })
  const response = await Axios.get(jwksUrl)
  logger.info('getCertificate2', {'response': response })
  const keys = response.data.keys
  logger.info('getCertificate3', {'keys': keys })

  if (!keys || !keys.length)
    throw new Error('No JWKS keys found')

  const signingKeys = keys.filter(
    key => key.use === 'sig'
           && key.kty === 'RSA'
           && key.alg === 'RS256'
           && key.n
           && key.e
           && key.kid
           && (key.x5c && key.x5c.length)
  )
  logger.info('getCertificate4', {'signingKeys': signingKeys })
  if (!signingKeys.length)
    throw new Error('No JWKS signing keys found')

  // XXX: Only handles single signing key
  const key = signingKeys[0]
  logger.info('getCertificate5', {'key': key })
  const pub = key.x5c[0]  // public key
  logger.info('getCertificate6', {'pub': pub })

  // Certificate found!
  cachedCertificate = certToPEM(pub)

  logger.info('getCertificate7', {'cachedCertificate': cachedCertificate })
  return cachedCertificate
}

function certToPEM(cert: string): string {
  cert = cert.match(/.{1,64}/g).join('\n')
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`
  return cert
}