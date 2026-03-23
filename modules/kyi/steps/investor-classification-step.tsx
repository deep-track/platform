"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { kyiSubmissionSchema, type KYISubmissionData } from "@/lib/kyi-types";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface InvestorClassificationStepProps {
  defaultValues?: Partial<KYISubmissionData>;
  onNext: (data: Pick<KYISubmissionData, "investorType" | "accreditationStatus" | "investmentAmount" | "investmentCurrency" | "sourceOfFunds" | "isPEP">) => void;
}

const schema = kyiSubmissionSchema.pick({
  investorType: true,
  accreditationStatus: true,
  investmentAmount: true,
  investmentCurrency: true,
  sourceOfFunds: true,
  isPEP: true,
  governmentIdType: true,
  governmentIdUrl: true,
  governmentIdBase64: true,
  selfieUrl: true,
  selfieBase64: true,
  bankStatementUrl: true,
  proofOfAddressUrl: true,
});

export function InvestorClassificationStep({ defaultValues, onNext }: InvestorClassificationStepProps) {
  const form = useForm<Pick<KYISubmissionData, "investorType" | "accreditationStatus" | "investmentAmount" | "investmentCurrency" | "sourceOfFunds" | "isPEP" | "governmentIdType" | "governmentIdUrl" | "governmentIdBase64" | "selfieUrl" | "selfieBase64" | "bankStatementUrl" | "proofOfAddressUrl">>({
    resolver: zodResolver(schema),
    defaultValues: {
      investorType: defaultValues?.investorType,
      accreditationStatus: defaultValues?.accreditationStatus,
      investmentAmount: defaultValues?.investmentAmount ?? "",
      investmentCurrency: defaultValues?.investmentCurrency ?? "USD",
      sourceOfFunds: defaultValues?.sourceOfFunds,
      isPEP: defaultValues?.isPEP ?? false,
      governmentIdType: defaultValues?.governmentIdType ?? "passport",
      governmentIdUrl: defaultValues?.governmentIdUrl ?? "placeholder",
      governmentIdBase64: defaultValues?.governmentIdBase64 ?? "placeholder",
      selfieUrl: defaultValues?.selfieUrl ?? "placeholder",
      selfieBase64: defaultValues?.selfieBase64 ?? "placeholder",
      bankStatementUrl: defaultValues?.bankStatementUrl ?? "placeholder",
      proofOfAddressUrl: defaultValues?.proofOfAddressUrl ?? "placeholder",
    },
  });

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((values) =>
          onNext({
            investorType: values.investorType,
            accreditationStatus: values.accreditationStatus,
            investmentAmount: values.investmentAmount,
            investmentCurrency: values.investmentCurrency,
            sourceOfFunds: values.sourceOfFunds,
            isPEP: values.isPEP,
          }),
        )}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField control={form.control} name="investorType" render={({ field }) => (
            <FormItem>
              <FormLabel>Investor Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="joint">Joint</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="fund">Fund</SelectItem>
                  <SelectItem value="trust">Trust</SelectItem>
                  <SelectItem value="pension_fund">Pension Fund</SelectItem>
                  <SelectItem value="family_office">Family Office</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="accreditationStatus" render={({ field }) => (
            <FormItem>
              <FormLabel>Accreditation</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="accredited">Accredited</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="institutional">Institutional</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="investmentAmount" render={({ field }) => (
            <FormItem>
              <FormLabel>Investment Amount</FormLabel>
              <FormControl><Input placeholder="100000" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="investmentCurrency" render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <FormControl><Input placeholder="USD" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="sourceOfFunds" render={({ field }) => (
            <FormItem>
              <FormLabel>Source of Funds</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="employment_income">Employment Income</SelectItem>
                  <SelectItem value="business_income">Business Income</SelectItem>
                  <SelectItem value="investment_returns">Investment Returns</SelectItem>
                  <SelectItem value="inheritance">Inheritance</SelectItem>
                  <SelectItem value="property_sale">Property Sale</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="isPEP" render={({ field }) => (
            <FormItem>
              <FormLabel>PEP</FormLabel>
              <Select onValueChange={(v) => field.onChange(v === "true")} defaultValue={String(field.value)}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="false">No</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white">
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
}
