import { Button } from '@/components/ui/button'
import React from 'react'
import { HugeiconsIcon } from "@hugeicons/react";
import { Home01Icon } from "@hugeicons/core-free-icons";

function Homepage() {
  return (
    <div>
      <Button>
        <HugeiconsIcon
          icon={Home01Icon}
          size={24}
          color="currentColor"
          strokeWidth={1.5}
        />
      Click Me nigger
      </Button>
    </div>
  )
}

export default Homepage