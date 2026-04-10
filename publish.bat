@echo off
echo NPM PUBLISH
echo Before continuing, ensure that:
echo - you are logged in (npm whoami)
echo - you have successfully rebuilt all the libraries (npm run...)
pause

cd .\dist\myrmidon\cadmus-part-ndp-notable-word-forms
call npm publish --access=public
cd ..\..\..
pause

cd .\dist\myrmidon\cadmus-part-ndp-pg
call npm publish --access=public
cd ..\..\..
pause

cd .\dist\myrmidon\cadmus-part-ndp-text-passages
call npm publish --access=public
cd ..\..\..
pause

cd .\dist\myrmidon\cadmus-part-ndpbooks-fig-plan
call npm publish --access=public
cd ..\..\..
pause

cd .\dist\myrmidon\cadmus-part-ndpbooks-fonts
call npm publish --access=public
cd ..\..\..
pause

cd .\dist\myrmidon\cadmus-part-ndpbooks-pg
call npm publish --access=public
cd ..\..\..
pause

cd .\dist\myrmidon\cadmus-part-ndpdrw-pg
call npm publish --access=public
cd ..\..\..
pause

cd .\dist\myrmidon\cadmus-part-ndpdrw-tech
call npm publish --access=public
cd ..\..\..
pause

cd .\dist\myrmidon\cadmus-part-ndpfrac-layout
call npm publish --access=public
cd ..\..\..
pause

cd .\dist\myrmidon\cadmus-part-ndpfrac-pg
call npm publish --access=public
cd ..\..\..
pause

cd .\dist\myrmidon\cadmus-part-ndpfrac-quire-labels
call npm publish --access=public
cd ..\..\..
pause

cd .\dist\myrmidon\cadmus-part-ndpfrac-rulings
call npm publish --access=public
cd ..\..\..
pause

cd .\dist\myrmidon\cadmus-part-ndpfrac-support
call npm publish --access=public
cd ..\..\..
pause
