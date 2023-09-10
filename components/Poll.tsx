import { Poll } from '@/shared/types';
import React, { useState } from 'react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Button } from './ui/button';
import { useAppDispatch } from '@/redux/store';
import { RoomsActions } from '@/redux/slices/roomsSlice';
import { useToast } from './ui/use-toast';
import { useUserContext } from '@/context/UserContext';
import { useRoomID } from '@/hooks/useRoomID';
import { useMeta } from '@/hooks/useMeta';
import { CheckCheck, CheckCircle, CheckIcon } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { run } from '@/lib/utils';
import { Label } from './ui/label';

type Props = {
  poll: Poll;
};

const Poll = ({ poll }: Props) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>(
    localStorage.getItem(poll.id) ?? undefined
  );
  const dispatch = useAppDispatch();
  const userContext = useUserContext();
  const roomID = useRoomID();
  const toaster = useToast();
  const getMeta = useMeta();

  // <ContextMenuItem>Profile</ContextMenuItem>
  // <ContextMenuItem>Billing</ContextMenuItem>
  // <ContextMenuItem>Team</ContextMenuItem>
  // <ContextMenuItem>Subscription</ContextMenuItem>
  return (
    <div
      key={poll.id}
      className="border  w-3/4 my-5 rounded-md shadow-md shadow-secondary  "
    >
      <ContextMenu>
        <ContextMenuTrigger className="w-full h-full ">
          <ContextMenuContent className="p-3 flex items-center justify-start">
            <div className="flex w-full h-14">Adjust visibility</div>
          </ContextMenuContent>

          <div className=" w-full  flex flex-wrap   p-3">
            {poll.question.text}
          </div>
          <div className="flex flex-col ">
            <RadioGroup
              onValueChange={(value) => {
                setSelectedAnswer(value);
              }}
              value={selectedAnswer}
              defaultValue="option-one"
            >
              {poll.question.answers.map((answer) => (
                <div className="w-full h-full flex  border-t" key={answer.id}>
                  <div
                    style={{
                      width: 'calc(3rem + 20px) ',
                    }}
                    // className="h-full  w-3/4 px-3"
                    className=" h-full min-h-[60px] flex items-center justify-center"
                  >
                    {/* <Button
              variant={'outline'}
              className="w-12  "
              onClick={() => {}}
            >
              {
                poll.votes.filter(
                  (vote) => vote.ansID === answer.id
                ).length
              }
            </Button> */}
                    <RadioGroupItem value={answer.id} id={answer.id} />
                    <div className="ml-2">
                      {userContext.user.role === 'admin' &&
                        poll.votes.filter((vote) => vote.ansID === answer.id)
                          .length}
                    </div>

                    {/* <Label htmlFor="option-one">Option One</Label> */}
                  </div>
                  <Label
                    htmlFor={answer.id}
                    style={{
                      width: 'calc(90% - 3rem) ',
                      wordWrap: 'break-word',
                    }}
                    className="h-full  w-3/4 px-6 py-2"
                  >
                    {answer.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {poll.question.answers.length !== 0 && (
              <div className="w-full flex items-center justify-between p-3  min-h-[60px] border-t">
                <Button
                  disabled={
                    userContext.user.role !== 'admin' &&
                    !!localStorage.getItem(poll.id)
                  }
                  // className="bg-primary "
                  variant={'outline'}
                  onClick={() => {
                    console.log(
                      'yoadle',
                      userContext.user.role,
                      userContext.user.role === 'admin',
                      poll.votes.filter((vote) => vote.ansID === selectedAnswer)
                        .length
                    );

                    if (!selectedAnswer) {
                      toaster.toast({
                        title: 'No vote selected',
                        description: 'Please select an option to submit a vote',
                      });
                      return;
                    }
                    // const answersVotedOn: Array<string> = JSON.parse(localStorage.getItem(poll.id) ?? '[]')
                    localStorage.setItem(poll.id, selectedAnswer);

                    dispatch(
                      RoomsActions.vote(
                        {
                          vote: {
                            ansID: selectedAnswer,
                            userID: userContext.userID,
                          },
                          poll: { id: poll.id },
                          roomID,
                        },
                        getMeta()
                      )
                    );
                  }}
                >
                  {run(() => {
                    if (userContext.user.role === 'admin') {
                      return <>Submit as much you want</>;
                    } else {
                      return (
                        <>
                          {' '}
                          {!!localStorage.getItem(poll.id)
                            ? 'Submitted'
                            : 'Submit'}
                        </>
                      );
                    }
                  })}
                </Button>
              </div>
            )}
          </div>
        </ContextMenuTrigger>
      </ContextMenu>
    </div>
  );
};

export default Poll;
