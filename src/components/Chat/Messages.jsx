import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Bubble,
  BubbleContent,
  BubbleGroup,
  BubbleReactions,
} from "@/components/ui/bubble"
import { Marker, MarkerContent } from "@/components/ui/marker"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
} from "@/components/ui/message"
import { Textarea } from "../ui/textarea"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { PlusCircle, Send } from "lucide-react"


export function MessageDemo() {
  return (
    <div className="flex w-full flex-col gap-6 py-12">
      <Message align="end">
        <MessageAvatar>
          <Avatar>
            <AvatarImage src="/avatars/10.png" alt="@me" />
            <AvatarFallback>ME</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <Bubble>
            <BubbleContent>Deploying to prod real quick.</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message>
        <MessageAvatar>
          <Avatar>
            <AvatarImage src="/avatars/02.png" alt="@rabbit" />
            <AvatarFallback>R</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <Bubble variant="muted">
            <BubbleContent>It&apos;s 4:55 PM. On a Friday.</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageAvatar>
          <Avatar>
            <AvatarImage src="/avatars/10.png" alt="@me" />
            <AvatarFallback>ME</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <Bubble>
            <BubbleContent>It&apos;s a one-line change.</BubbleContent>
          </Bubble>
          <MessageFooter>Delivered</MessageFooter>
        </MessageContent>
      </Message>
      <Message>
        <MessageAvatar>
          <Avatar>
            <AvatarImage src="/avatars/02.png" alt="@rabbit" />
            <AvatarFallback>R</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <BubbleGroup>
            <Bubble variant="muted">
              <BubbleContent>
                It&apos;s always a one-line change 😭.
              </BubbleContent>
            </Bubble>
            <Bubble variant="muted">
              <BubbleContent>Alright, let me take a look.</BubbleContent>
              <BubbleReactions aria-label="Reactions: thumbs up">
                <span>👍</span>
              </BubbleReactions>
            </Bubble>
          </BubbleGroup>
        </MessageContent>
      </Message>
        <Card className="min-h-max! flex items-start flex-row px-2 py-2! mt-5">
             <Button
               variant={"outline"}
               aria-label="Attach a file"
               render={<label htmlFor="chat-file" className="cursor-pointer" />}
             >
                <input id="chat-file" type="file" className="sr-only" />
               <PlusCircle />
            </Button>
            <Textarea className="bg-transparent! resize-none min-h-max! border-none! focus:ring-0!"></Textarea>
             <Button>
               <Send />
            </Button>
        </Card>
      <Marker role="status">
        <MarkerContent className="shimmer">
          <span className="font-medium">Oliver</span> is typing...
        </MarkerContent>
      </Marker>
    </div>
  )
}
