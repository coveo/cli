import {cpSync} from 'node:fs';

cpSync('../vue-template/', './template/', {recursive: true});
