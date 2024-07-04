import { NextApiRequest, NextApiResponse } from 'next'
import prisma from 'src/utils/prisma'



const createUserInSanity = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const userDoc = {
      _type: 'users',
      _id: req.body.userWalletAddress,
      name: req.body.name,
      walletAddress: req.body.userWalletAddress,
    }

    await prisma.createIfNotExists(userDoc)

    res.status(200).send({ message: 'success' })
  } catch (error) {
    res.status(500).send({ message: 'error', data: error })
  }
}

export default createUserInSanity