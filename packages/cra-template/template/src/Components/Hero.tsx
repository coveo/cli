import {Grid, Typography} from '@material-ui/core';
import React from 'react';
import './Hero.css';

interface IHeroProps {
  logos: string[];
  welcome: string;
}

function Anchor(props: React.HTMLProps<HTMLAnchorElement>) {
  return <a href={props.href}>{props.value}</a>;
}

const Hero: React.FunctionComponent<IHeroProps> = (props) => {
  return (
    <header className="App-header">
      <Grid className="logo-container">
        {props.logos.map((logo) => (
          <img src={logo} className="App-logo" alt="logo" />
        ))}
      </Grid>

      <Typography variant="h5">{props.welcome}</Typography>
      <Typography variant="body1">
        This sample search page was built with{' '}
        <Anchor
          href="https://material-ui.com/getting-started/installation"
          value="Material-ui"
        />{' '}
        and the{' '}
        <Anchor
          href="https://docs.coveo.com/en/headless"
          value="Coveo Headless Library"
        />
        .<br></br>
      </Typography>
      <Typography variant="body1">
        Edit{' '}
        <b>
          <code>src/App.tsx</code>
        </b>{' '}
        and save to reload.
      </Typography>

      <Typography variant="subtitle1" component="h6">
        Customize your search page theme
      </Typography>
      <Typography variant="body1">
        You can customize your theme by modifying the{' '}
        <b>
          <code>src/theme.tsx</code>
        </b>
        . For more information about theme customization, visit{' '}
        <Anchor
          href="https://material-ui.com/customization/theming/"
          value="Material-ui theming"
        />
        .
      </Typography>

      <Typography variant="subtitle1" component="h6">
        Essential Links
      </Typography>
      <ul>
        <li>
          <Anchor
            href="https://docs.coveo.com/en/headless"
            value="Coveo Headless documentation"
          />
        </li>
        <li>
          <Anchor href="https://reactjs.org" value="React documentation" />
        </li>
        <li>
          <Anchor
            href="https://material-ui.com/"
            value="Material-ui Documentation"
          />
        </li>
      </ul>
    </header>
  );
};

export default Hero;
