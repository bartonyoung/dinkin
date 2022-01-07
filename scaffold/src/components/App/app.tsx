import React from 'react';
import '../../styles.css';

const App = () => {
	return (
    <div className="flex h-screen">
      <div className="m-auto">
        <h3 className='sm:text-base md:text-2xl lg:text-4xl font-semibold text-center'>Welcome to React Boilerplate</h3>
		<img alt="File:React-icon.svg" src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/512px-React-icon.svg.png" decoding="async" width="512" height="362" srcSet="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/768px-React-icon.svg.png 1.5x, https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1024px-React-icon.svg.png 2x" data-file-width="512" data-file-height="362"></img>
      </div>
    </div>
  );
}

export default App;