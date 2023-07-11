import express from "express";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.post("/location/:userUid", async (req, res) => {
  const userUid = req.params.userUid;
  console.log(userUid);

  return res.status(200).send({
    userUid: userUid,
    body: req.body,
  });
});

try {
  app.listen(port, () =>
    console.log(`HelloNode app listening on port ${port}!`)
  );
} catch (error) {
  console.error(`Error occured: ${error}`);
}
