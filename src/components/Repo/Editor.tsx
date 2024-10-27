import React from 'react'
import FilesSidebar from './FilesSidebar'
import Code from './Code'

const Editor = () => {
  return (
    <div className='min-h-60 flex gap-2 w-full'>
      <FilesSidebar/>
      <Code/>
    </div>
  )
}

export default Editor