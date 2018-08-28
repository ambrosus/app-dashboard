
module.exports = (req, res, next) => {
  try {
    const address = req.body.address || req.params.address || req.query.address;
    const session = req.session;

    if (!session || !session.user || address !== session.user.address) {
      throw 'Unauthorized';
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: error });
  }
};
