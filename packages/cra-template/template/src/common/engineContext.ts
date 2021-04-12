import {Engine} from '@coveo/headless';
import React from 'react';

const EngineContext = React.createContext<Engine<any> | null>(null);

export const EngineProvider = EngineContext.Provider;

export default EngineContext;
