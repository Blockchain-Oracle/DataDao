// "use client";

// import { Component, ErrorInfo, ReactNode } from "react";
// import { Button } from "./ui/button";
// import { AlertCircle } from "lucide-react";

// interface Props {
//   children: ReactNode;
//   fallback?: ReactNode;
// }

// interface State {
//   hasError: boolean;
//   error: Error | null;
// }

// export class ErrorBoundary extends Component<Props, State> {
//   public state: State = {
//     hasError: false,
//     error: null,
//   };

//   public static getDerivedStateFromError(error: Error): State {
//     return { hasError: true, error };
//   }

//   public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
//     console.error("Uncaught error:", error, errorInfo);
//   }

//   public render() {
//     if (this.state.hasError) {
//       return (
//         this.props.fallback || (
//           <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
//             <AlertCircle className="h-10 w-10 text-destructive" />
//             <div className="text-center">
//               <h2 className="text-lg font-semibold">Something went wrong</h2>
//               <p className="text-sm text-muted-foreground">
//                 {this.state.error?.message || "An unexpected error occurred"}
//               </p>
//             </div>
//             <Button variant="outline" onClick={() => window.location.reload()}>
//               Try again
//             </Button>
//           </div>
//         )
//       );
//     }

//     return this.props.children;
//   }
// }
