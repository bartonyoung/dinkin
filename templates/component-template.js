const componentTemplate = `
import React from 'react';

interface COMPONENT_NAMEProps {}

const COMPONENT_NAME = (props: COMPONENT_NAMEProps) => {
  return (
    <button className={'text-xs font-semibold rounded-full px-4 py-1 leading-normal bg-white border border-purple text-purple hover:bg-purple hover:text-white'}>Message</button>
  );
};

export default COMPONENT_NAME;
`;

module.exports = componentTemplate;
