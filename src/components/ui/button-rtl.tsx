
import * as React from "react"
import { Button, ButtonProps } from "@/components/ui/button"
import { useLanguage } from "@/contexts/LanguageContext"
import { cn } from "@/lib/utils"

const ButtonRTL = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => {
    const { isRTL } = useLanguage();

    return (
      <Button
        className={cn(
          // RTL-specific adjustments
          isRTL && [
            "flex-row-reverse", // Reverse flex direction for icons
            "[&_svg]:ml-0 [&_svg]:mr-2", // Fix icon spacing for RTL
            "text-right", // Align text to right
          ],
          className
        )}
        ref={ref}
        {...props}
        dir={isRTL ? "rtl" : "ltr"}
      >
        {children}
      </Button>
    )
  }
)
ButtonRTL.displayName = "ButtonRTL"

export { ButtonRTL }
