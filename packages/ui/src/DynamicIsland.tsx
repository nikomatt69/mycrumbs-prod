import { useEffectOnce } from 'usehooks-ts';
import { useEffect, useState} from 'react';
import Link from 'next/link';



export const DynamicIsland = () => {

  const [meetingUrl, setMeetingUrl] = useState('');
 

  const currentUrl = window.location.href;
  // eslint-disable-next-line no-use-before-define
  useEffectOnce(() => {
    setMeetingUrl(currentUrl);
    localStorage.setItem(meetingUrl, meetingUrl); 
  }, );
  return (
    <div className="h-max-10 max-w-80 relative left-auto z-[100] mx-auto flex items-stretch justify-center gap-1 overflow-auto rounded-3xl bg-black/80 p-1 shadow-2xl">
      <div className="h-max-10 flex items-stretch  justify-between gap-1">
        <div className="mt-1flex grow basis-[0%] flex-col items-stretch self-start">

          <div className="mt-0.5 whitespace-nowrap text-xs leading-5 text-white">
            <Link href={meetingUrl}>{meetingUrl}</Link>
          </div>
        </div>
      </div>
    </div>
  );
};


