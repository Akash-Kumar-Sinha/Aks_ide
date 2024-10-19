import jwt from "jsonwebtoken";

const createToken = async (email: string) => {
  try {
    const token = jwt.sign(
      {
        data: email,
      },
      "JWT_SECRET_KEY",
      { expiresIn: "10m" }
    );

    return token;
  } catch {
    console.log("Unable to create Token");
  }
};

export default createToken;