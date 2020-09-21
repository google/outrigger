### Source Code Files
All source code files must start with the correct license agreement. This is one
of the OSS requirements imposed by Google
(see go/releasing/preparing#license-headers). Please use the
addlicense{target="\_blank"} tool for including the license header. Here is an
example for adding the Apache 2.0 license to all source code files in the
current directory:
`go get -u github.com/google/addlicense && ~/go/bin/addlicense -l apache`

Note: This command is idempotent; it will not add the license to files that
already have it. Beware however since it will not take into consideration any
excluded files listed in the copybara configuration. So make sure you review
all modified files after running the script and revert anyundesired chages.
