import prisma from 'src/utils/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

const query = `
*[_type=="rides"]{
  "service": title,
  "iconUrl": icon.asset->url,
  priceMultiplier,
  orderById
}|order(orderById asc)
`

const getRideTypes = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const sanityResponse = await prisma.fetch(query)

    res.status(200).send({ message: 'success', data: sanityResponse })
  } catch (error) {
    res.status(500).send({ message: 'error', data: error })
  }
}

export default getRideTypes