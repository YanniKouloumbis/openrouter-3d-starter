"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import CanvasComponent from "@/components/canvas"

export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [objectLink, setObjectLink] = useState<string>("A chair shaped like an avocado.ply")
  const [inputText, setInputText] = useState("")
  const [generating, setGenerating] = useState<boolean>(false)
  const [numInferenceSteps, setNumInferenceSteps] = useState<number>(32)
  const [openrouterApiKey, setOpenrouterApiKey] = useState<string>("")
  const ai = useRef<any>(null)

  useEffect(() => {
    const openrouterApiKeyFromStorage = localStorage.getItem('openrouterApiKey');
    if (openrouterApiKeyFromStorage) {
      setOpenrouterApiKey(openrouterApiKeyFromStorage);
    } else {
      const codeFromSearchParams = searchParams.get('code');
      if (codeFromSearchParams) {
        fetch("https://openrouter.ai/api/v1/auth/keys", {
          method: 'POST',
          body: JSON.stringify({ code: codeFromSearchParams })
        })
        .then(res => res.json())
        .then(res => {
          if (res.key) {
            localStorage.setItem('openrouterApiKey', res.key);
            setOpenrouterApiKey(res.key);
          }
        })
        .catch(err => console.error(err));
      }
    }
  }, []);
  
  // Sends POST request to generate a 3D object based on prompt and number of inference steps provided as input.
  const generate3DObject = async (): Promise<string> => {
    const output = await fetch("https://openrouter.ai/api/v1/objects/generations", {
      method: 'POST',
      body: JSON.stringify({
        prompt: inputText,
        numInferenceSteps: numInferenceSteps
      }),
      headers: {
        "HTTP-Referer": "https://test.com",
        "X-Title": "test",
        "Authorization": `Bearer ${openrouterApiKey}`
      }
    });
    const generations = await output.json();
    return generations.data[0].uri;
  };
  
  /** 
   * Handle the generation of a 3D object and sets the URI to the 'objectLink' state.
   * @async
   */
  const handleGenerate = async () => {
    try {
      setGenerating(true);
      if (!openrouterApiKey) {
        toast({ title: "Please login with Openrouter." });
        return;
      }
      const dataUri = await generate3DObject();
      setObjectLink(dataUri);
    } catch (error) {
      toast({ title: "Error generating model." });
    } finally {
      setGenerating(false);
    }
  };
  
  /** 
   * Handle download of the 3D object by creating a temporary link on DOM and initiating a click on it.
   */
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = objectLink as string;
    link.download = `${inputText}.ply`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <div className="flex flex-col h-screen w-full">
      <Card className="h-full">
        <CardContent className="flex flex-col md:flex-row h-full">
          <div className="w-full md:w-1/2 h-2/3 overflow-auto p-1 md:ml-10 md:mt-10 -mb-20">
            <Label htmlFor="promptInput">Prompt</Label>
            <Input
              placeholder="A chair shaped like an avocado"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <Label htmlFor="numInferenceSteps">Quality</Label>
            <div className="mb-5">
              <Select
                onValueChange={(value: string) =>
                  setNumInferenceSteps(parseInt(value))
                }
                defaultValue="32"
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Quality " />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16">Low</SelectItem>
                  <SelectItem value="32">Medium</SelectItem>
                  <SelectItem value="54">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-row">
              <Button className="mr-3" onClick={handleGenerate}>
                {!generating ? "Generate Model" : <Loader className="spin" />}
              </Button>
              <Button className="mr-3" onClick={handleDownload}>
                Download Model
              </Button>
            </div>
            <Button
              className="mt-2"
              onClick={() => {
                if (openrouterApiKey) {
                  localStorage.removeItem("openrouterApiKey")
                  setOpenrouterApiKey("")
                } else {
                  router.push(
                    `https://openrouter.ai/auth?callback_url=${
                      window.location.origin + window.location.pathname
                    }`
                  )
                }
              }}
            >
              {openrouterApiKey
                ? "Clear Openrouter API Key"
                : "Login With Openrouter"}
            </Button>
          </div>
          <div className="w-full md:w-1/2 h-full overflow-auto p-1">
            {objectLink && <CanvasComponent objectLink={objectLink} />}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
