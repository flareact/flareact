import * as React from 'react';
import CustomAppBar from '../src/CustomAppBar';
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
export default function Index() {
  return (
    <>
      <CustomAppBar />
      <Container sx={{padding: 15}}>
        <Typography
          variant="h1"
        >
          Hello, world!
        </Typography>
        <Typography
          variant="h5"
        >
          This is a React app made with material-ui, rendered on the Edge!
        </Typography>
      </Container>

    </>
  );
}