import React, { useEffect } from 'react'

const App = () => {
  const [topics, setTopics] = React.useState({})

  useEffect(() => {
    console.log('Current topics:', topics)
  }, [topics])

  return (
    <div>
      {/* Rest of the component code */}
      {console.log('Rendering App with topics:', Object.keys(topics).length, 'topics')}
    </div>
  )
}

export default App 