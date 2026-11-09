# HCF Public Health Call for Proposals

Evaluate a donor’s call before it opens, or review a past application against its original call. The result is a criterion-by-criterion HCF assessment with source evidence and suggested edits. The funder’s published selection criteria govern the original competition.

## Run a review

Requires Node.js 18 or later. No packages, accounts or network calls are needed by the CLI. Use UTF-8 text copied from the document and retain headings and page markers. For PDFs or scanned material verify extracted text against the original. Keep private submissions outside the repository.

1. Choose **call** or **application**, record the document date and version, and identify missing attachments. For a past application, supply the call that actually applied at submission.
2. Generate a worksheet. A reviewer or agent follows the [review instructions](REVIEW.md) and [versioned taxonomy](taxonomy/v0.1.json) to complete it.
3. Run the report command. It checks source fingerprints, evidence and edit anchors, then prints a Markdown report. A reviewer decides which edits to accept.

~~~sh
node review.mjs init call call.txt > worksheet.json
node review.mjs report worksheet.json call.txt > review.md

node review.mjs init application submission.txt original-call.txt > application-review.json
node review.mjs report application-review.json submission.txt original-call.txt > application.md
~~~

To try the completed public example:

~~~sh
node review.mjs report examples/nih-review.json examples/nih-call-excerpt.txt
~~~

The example reviews one cost criterion from NIH PAR-25-144. It yields 1/2 on scale and marks five criteria unassessed. That is an excerpt review, not a rating of the entire opportunity. [Original NIH notice, Section V](https://grants.nih.gov/grants/guide/pa-files/PAR-25-144.html)

## Find source material

- [HCF Hub documents](https://hcfhub.org/#/documents) includes campaign procurement RFPs, contracts and award notices. The [current and past grant calls collection](https://hcfhub.org/#/documents?view=grant-calls) is prepared for the next Hub release. Check the issuing funder’s amendments and deadlines before treating a call as open.
- NIH provides [a newer call](https://grants.nih.gov/grants/guide/pa-files/PAR-25-144.html), [an archived call](https://grants.nih.gov/grants/guide/pa-files/PAR-19-274.html) and [funded application excerpts with the original funding notice identified](https://cancercontrol.cancer.gov/is/funding/sample-grant-applications). Respect each sample’s terms and identify omitted sections.
